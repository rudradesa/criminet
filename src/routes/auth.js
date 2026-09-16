const express = require('express');
const bcrypt = require('bcryptjs');

const { driver } = require('../config/neo4j');

const router = express.Router();

const NEO4J_DATABASE =
    process.env.NEO4J_DATABASE || 'neo4j';


/*
|--------------------------------------------------------------------------
| GET /login
|--------------------------------------------------------------------------
*/

router.get('/login', (req, res) => {

    if (
        req.session &&
        req.session.isUser === true
    ) {
        return res.redirect('/dashboard');
    }

    res.render('login', {
        error: null
    });
});


/*
|--------------------------------------------------------------------------
| POST /login
|--------------------------------------------------------------------------
*/

router.post('/login', async (req, res) => {

    let session;

    try {

        const {
            username,
            password
        } = req.body;


        /*
         * Validate input
         */

        if (!username || !password) {

            return res.status(400).render(
                'login',
                {
                    error:
                        'Username and password are required.'
                }
            );
        }


        /*
         * Create Neo4j session
         */

        session = driver.session({
            database: NEO4J_DATABASE
        });


        /*
         * Find user in Neo4j
         */

        const result = await session.run(
            `
            MATCH (u:USER)
            WHERE toLower(u.username) = toLower($username)

            RETURN
                u.userId AS userId,
                u.username AS username,
                u.passwordHash AS passwordHash,
                u.fullName AS fullName,
                u.email AS email,
                u.role AS role,
                u.status AS status

            LIMIT 1
            `,
            {
                username: username.trim()
            }
        );


        /*
         * User not found
         */

        if (result.records.length === 0) {

            return res.status(401).render(
                'login',
                {
                    error:
                        'Invalid username or password.'
                }
            );
        }


        /*
         * Get user record
         */

        const user =
            result.records[0];


        const userId =
            user.get('userId');

        const passwordHash =
            user.get('passwordHash');

        const status =
            user.get('status');


        /*
         * Check password
         */

        const passwordValid =
            await bcrypt.compare(
                password,
                passwordHash
            );


        if (!passwordValid) {

            return res.status(401).render(
                'login',
                {
                    error:
                        'Invalid username or password.'
                }
            );
        }


        /*
         * Check account status
         */

        if (status !== 'ACTIVE') {

            return res.status(403).render(
                'login',
                {
                    error:
                        'Your account has been blocked. Contact an administrator.'
                }
            );
        }


        /*
         * Close the lookup session
         *
         * We don't use this session after
         * authentication.
         */

        await session.close();

        session = null;


        /*
         * Create secure login session
         */

        req.session.regenerate((err) => {

            if (err) {

                console.error(
                    'Session regeneration error:',
                    err
                );

                return res.status(500).render(
                    'login',
                    {
                        error:
                            'Login failed. Please try again.'
                    }
                );
            }


            /*
             * Store authenticated user
             * information in session
             */

            req.session.isUser = true;

            req.session.userId =
                userId;

            req.session.username =
                user.get('username');

            req.session.fullName =
                user.get('fullName');

            req.session.role =
                user.get('role');


            /*
             * Save session
             */

            req.session.save(async (saveErr) => {

                if (saveErr) {

                    console.error(
                        'Session save error:',
                        saveErr
                    );

                    return res.status(500).render(
                        'login',
                        {
                            error:
                                'Login failed. Please try again.'
                        }
                    );
                }


                /*
                 * Update last login
                 *
                 * IMPORTANT:
                 * This uses a NEW Neo4j session.
                 */

                const loginUpdateSession =
                    driver.session({
                        database: NEO4J_DATABASE
                    });


                try {

                    await loginUpdateSession.run(
                        `
                        MATCH (u:USER {userId: $userId})

                        SET u.lastLogin = datetime()
                        `,
                        {
                            userId: userId
                        }
                    );

                } catch (e) {

                    /*
                     * Login should still succeed
                     * even if lastLogin update fails.
                     */

                    console.error(
                        'Last login update error:',
                        e
                    );

                } finally {

                    await loginUpdateSession.close();

                }


                /*
                 * Login successful
                 */

                res.redirect('/dashboard');

            });

        });

    } catch (error) {

        console.error(
            'User login error:',
            error
        );


        /*
         * Make sure the Neo4j session
         * is closed if an error occurs.
         */

        if (session) {

            try {
                await session.close();
            } catch (closeError) {
                console.error(
                    'Neo4j session close error:',
                    closeError
                );
            }

        }


        /*
         * Return login error
         */

        return res.status(500).render(
            'login',
            {
                error:
                    'Unable to login. Please try again.'
            }
        );
    }
});


/*
|--------------------------------------------------------------------------
| POST /logout
|--------------------------------------------------------------------------
*/

router.post('/logout', (req, res) => {

    req.session.destroy((err) => {

        if (err) {

            console.error(
                'User logout error:',
                err
            );
        }


        res.clearCookie('connect.sid');

        res.redirect('/');

    });

});


/*
|--------------------------------------------------------------------------
| Export router
|--------------------------------------------------------------------------
*/

module.exports = router;