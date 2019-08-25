import 'jest';
import * as request from 'supertest';

const address: string = (<any>global).address;
const auth: string = (<any>global).auth;

test('get /users', () => {
  return request(address)
    .get('/users')
    .set('Authorization', auth)
    .then(response => {
      expect(response.status).toBe(200);
      expect(response.body.data).toBeInstanceOf(Array);
    })
    .catch(fail);
});

test('post /users', () => {
  return request(address)
    .post('/users')
    .set('Authorization', auth)
    .send({
      name: 'usuario1',
      email: 'usuario1@email.com',
      password: '123',
      cpf: '06947117640'
    })
    .then(response => {
      expect(response.status).toBe(200);
      expect(response.body._id).toBeDefined();
      expect(response.body.name).toBe('usuario1');
      expect(response.body.email).toBe('usuario1@email.com');
      expect(response.body.cpf).toBe('06947117640');
      expect(response.body.password).toBeUndefined();
    })
    .catch(fail);
});

test('get /users/aaaa - not found', () => {
  return request(address)
    .get('/users/aaaa')
    .set('Authorization', auth)
    .then(response => {
      expect(response.status).toBe(404);
    })
    .catch(fail);
});

test('patch /users/:id', () => {
  return request(address)
    .get('/users?email=admin@meat.com')
    .set('Authorization', auth)
    .then(response =>
      request(address)
        .patch(`/users/${response.body.data[0]._id}`)
        .set('Authorization', auth)
        .send({
          name: 'usuario2 - patch'
        })
    )
    .then(response => {
      expect(response.status).toBe(200);
      expect(response.body._id).toBeDefined();
      expect(response.body.name).toBe('usuario2 - patch');
      expect(response.body.email).toBe('admin@meat.com');
      expect(response.body.password).toBeUndefined();
    })
    .catch(fail);
});
