// OPTIONAL sample data for development/testing.
// Run schema.cypher first.

MERGE (p:Person {personId:'PER-DEMO-001'})
SET p.firstName='Raj', p.lastName='Patel', p.dateOfBirth='1995-04-12', p.gender='Male', p.nationality='Indian', p.identificationNumber='DEMO-ID-001', p.status='PERSON_OF_INTEREST', p.createdAt=coalesce(p.createdAt, datetime().toString());

MERGE (c:Case {caseId:'CASE-DEMO-001'})
SET c.title='Demo Investigation', c.description='Development sample case', c.caseType='OTHER', c.status='OPEN', c.openedDate='2026-09-09', c.createdAt=coalesce(c.createdAt, datetime().toString());

MERGE (v:Vehicle {vehicleId:'VEH-DEMO-001'})
SET v.registrationNumber='GJ01AB1234', v.make='Toyota', v.model='Innova', v.color='White', v.vehicleType='CAR', v.createdAt=coalesce(v.createdAt, datetime().toString());

MERGE (ph:Phone {phoneId:'PHONE-DEMO-001'})
SET ph.phoneNumber='9000000001', ph.imei='DEMO-IMEI-001', ph.carrier='Demo Carrier', ph.createdAt=coalesce(ph.createdAt, datetime().toString());

MERGE (a:Address {addressId:'ADDR-DEMO-001'})
SET a.addressLine='Demo Road', a.city='Ahmedabad', a.state='Gujarat', a.postalCode='380001', a.country='India', a.latitude='23.0225', a.longitude='72.5714', a.createdAt=coalesce(a.createdAt, datetime().toString());

MERGE (l:Location {locationId:'LOC-DEMO-001'})
SET l.name='Demo Location', l.description='Development sample location', l.address='Demo Road', l.city='Ahmedabad', l.state='Gujarat', l.latitude='23.0225', l.longitude='72.5714', l.createdAt=coalesce(l.createdAt, datetime().toString());
