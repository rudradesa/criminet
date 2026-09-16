const express = require('express');
const bcrypt = require('bcryptjs');

const { driver } = require('../config/neo4j');

const router = express.Router();

const ADMIN_USERNAME = process.env.ADMIN_USERNAME;
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH;


/*
|--------------------------------------------------------------------------
| Helper
|--------------------------------------------------------------------------
*/

async function getNextUserId(session) {
    const result = await session.run(`
        MATCH (u:USER)
        RETURN u.userId AS userId
        ORDER BY u.userId DESC
        LIMIT 1
    `);

    if (result.records.length === 0) {
        return 'USR-0001';
    }

    const lastId = result.records[0].get('userId');

    const number = parseInt(
        String(lastId).replace('USR-', ''),
        10
    );

    const nextNumber = Number.isNaN(number)
        ? 1
        : number + 1;

    return `USR-${String(nextNumber).padStart(4, '0')}`;
}


/*
|--------------------------------------------------------------------------
| ADMIN LOGIN
|--------------------------------------------------------------------------
*/

router.get('/', (req, res) => {

    if (req.session && req.session.isAdmin === true) {
        return res.redirect('/admin/dashboard');
    }

    res.render('admin-login', {
        error: null
    });
});


router.post('/login', async (req, res) => {

    try {

        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).render('admin-login', {
                error: 'Username and password are required.'
            });
        }

        if (!ADMIN_USERNAME || !ADMIN_PASSWORD_HASH) {

            console.error(
                'Admin credentials are not configured.'
            );

            return res.status(500).render('admin-login', {
                error: 'Admin authentication is not configured.'
            });
        }

        const usernameValid =
            username === ADMIN_USERNAME;

        const passwordValid =
            await bcrypt.compare(
                password,
                ADMIN_PASSWORD_HASH
            );

        if (!usernameValid || !passwordValid) {

            return res.status(401).render('admin-login', {
                error: 'Invalid username or password.'
            });
        }


        req.session.regenerate((err) => {

            if (err) {

                console.error(
                    'Session regeneration error:',
                    err
                );

                return res.status(500).render(
                    'admin-login',
                    {
                        error: 'Login failed. Please try again.'
                    }
                );
            }

            req.session.isAdmin = true;
            req.session.adminUsername = ADMIN_USERNAME;

            req.session.save((saveErr) => {

                if (saveErr) {

                    console.error(
                        'Session save error:',
                        saveErr
                    );

                    return res.status(500).render(
                        'admin-login',
                        {
                            error:
                                'Login failed. Please try again.'
                        }
                    );
                }

                res.redirect('/admin/dashboard');
            });
        });

    } catch (error) {

        console.error(
            'Admin login error:',
            error
        );

        res.status(500).render('admin-login', {
            error: 'Something went wrong.'
        });
    }
});


/*
|--------------------------------------------------------------------------
| ADMIN DASHBOARD
|--------------------------------------------------------------------------
*/

router.get('/dashboard', async (req, res) => {

    if (
        !req.session ||
        req.session.isAdmin !== true
    ) {
        return res.redirect('/admin');
    }

    let session;

    try {

        session = driver.session({
            database:
                process.env.NEO4J_DATABASE ||
                'neo4j'
        });

        const result = await session.run(`
            MATCH (u:USER)
            RETURN
                u.userId AS userId,
                u.username AS username,
                u.fullName AS fullName,
                u.email AS email,
                u.role AS role,
                u.status AS status,
                u.createdAt AS createdAt,
                u.lastLogin AS lastLogin
            ORDER BY u.createdAt DESC
        `);

        const users = result.records.map(record => ({
            userId: record.get('userId'),
            username: record.get('username'),
            fullName: record.get('fullName'),
            email: record.get('email'),
            role: record.get('role'),
            status: record.get('status'),
            createdAt: record.get('createdAt')
                ? record.get('createdAt').toString()
                : null,
            lastLogin: record.get('lastLogin')
                ? record.get('lastLogin').toString()
                : null
        }));

        res.render('admin-dashboard', {
            username: req.session.adminUsername,
            users,
            error: null,
            success: null
        });

    } catch (error) {

        console.error(
            'Dashboard error:',
            error
        );

        res.status(500).send(
            'Unable to load admin dashboard.'
        );

    } finally {

        if (session) {
            await session.close();
        }
    }
});


/*
|--------------------------------------------------------------------------
| CREATE USER
|--------------------------------------------------------------------------
*/

router.post('/users/create', async (req, res) => {

    if (
        !req.session ||
        req.session.isAdmin !== true
    ) {
        return res.redirect('/admin');
    }

    let session;

    try {

        const {
            username,
            password,
            fullName,
            email,
            role
        } = req.body;


        /*
         * Basic validation
         */

        if (
            !username ||
            !password ||
            !fullName
        ) {

            return res.status(400).send(
                'Username, password and full name are required.'
            );
        }


        if (password.length < 8) {

            return res.status(400).send(
                'Password must contain at least 8 characters.'
            );
        }


        const selectedRole =
            role === 'ADMIN'
                ? 'ADMIN'
                : 'INVESTIGATOR';


        session = driver.session({
            database:
                process.env.NEO4J_DATABASE ||
                'neo4j'
        });


        /*
         * Check username
         */

        const existing = await session.run(
            `
            MATCH (u:USER)
            WHERE toLower(u.username) = toLower($username)
            RETURN u
            LIMIT 1
            `,
            {
                username: username.trim()
            }
        );


        if (existing.records.length > 0) {

            return res.status(409).send(
                'Username already exists.'
            );
        }


        /*
         * Generate User ID
         */

        const userId =
            await getNextUserId(session);


        /*
         * Hash password
         */

        const passwordHash =
            await bcrypt.hash(
                password,
                12
            );


        /*
         * Create USER node
         */

        await session.run(
            `
            CREATE (u:USER {
                userId: $userId,
                username: $username,
                passwordHash: $passwordHash,
                fullName: $fullName,
                email: $email,
                role: $role,
                status: 'ACTIVE',
                createdAt: datetime(),
                updatedAt: datetime(),
                lastLogin: null
            })

            RETURN u
            `,
            {
                userId,
                username: username.trim(),
                passwordHash,
                fullName: fullName.trim(),
                email: email
                    ? email.trim()
                    : '',
                role: selectedRole
            }
        );


        /*
         * Return to dashboard
         */

        res.redirect(
            '/admin/dashboard?created=1'
        );

    } catch (error) {

        console.error(
            'Create user error:',
            error
        );

        res.status(500).send(
            'Unable to create user.'
        );

    } finally {

        if (session) {
            await session.close();
        }
    }
});


/*
|--------------------------------------------------------------------------
| BLOCK USER
|--------------------------------------------------------------------------
*/

router.post('/users/:userId/block', async (req, res) => {

    if (
        !req.session ||
        req.session.isAdmin !== true
    ) {
        return res.redirect('/admin');
    }

    let session;

    try {

        const userId = req.params.userId;

        session = driver.session({
            database:
                process.env.NEO4J_DATABASE ||
                'neo4j'
        });

        await session.run(
            `
            MATCH (u:USER {userId: $userId})
            SET
                u.status = 'BLOCKED',
                u.updatedAt = datetime()
            `,
            { userId }
        );

        res.redirect('/admin/dashboard');

    } catch (error) {

        console.error(
            'Block user error:',
            error
        );

        res.status(500).send(
            'Unable to block user.'
        );

    } finally {

        if (session) {
            await session.close();
        }
    }
});


/*
|--------------------------------------------------------------------------
| UNBLOCK USER
|--------------------------------------------------------------------------
*/

router.post('/users/:userId/unblock', async (req, res) => {

    if (
        !req.session ||
        req.session.isAdmin !== true
    ) {
        return res.redirect('/admin');
    }

    let session;

    try {

        const userId = req.params.userId;

        session = driver.session({
            database:
                process.env.NEO4J_DATABASE ||
                'neo4j'
        });

        await session.run(
            `
            MATCH (u:USER {userId: $userId})
            SET
                u.status = 'ACTIVE',
                u.updatedAt = datetime()
            `,
            { userId }
        );

        res.redirect('/admin/dashboard');

    } catch (error) {

        console.error(
            'Unblock user error:',
            error
        );

        res.status(500).send(
            'Unable to unblock user.'
        );

    } finally {

        if (session) {
            await session.close();
        }
    }
});


/*
|--------------------------------------------------------------------------
| DELETE USER
|--------------------------------------------------------------------------
*/

router.post('/users/:userId/delete', async (req, res) => {

    if (
        !req.session ||
        req.session.isAdmin !== true
    ) {
        return res.redirect('/admin');
    }

    let session;

    try {

        const userId = req.params.userId;

        session = driver.session({
            database:
                process.env.NEO4J_DATABASE ||
                'neo4j'
        });

        await session.run(
            `
            MATCH (u:USER {userId: $userId})
            DELETE u
            `,
            { userId }
        );

        res.redirect('/admin/dashboard');

    } catch (error) {

        console.error(
            'Delete user error:',
            error
        );

        res.status(500).send(
            'Unable to delete user.'
        );

    } finally {

        if (session) {
            await session.close();
        }
    }
});


/*
|--------------------------------------------------------------------------
| LOGOUT
|--------------------------------------------------------------------------
*/

router.post('/logout', (req, res) => {

    req.session.destroy((err) => {

        if (err) {
            console.error(
                'Logout error:',
                err
            );
        }

        res.clearCookie('connect.sid');

        res.redirect('/admin');
    });
});


module.exports = router;