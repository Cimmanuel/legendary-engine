const request = require('supertest')
const app = require('../src/app')
const User = require('../src/models/user')
const { userOne, setupDatabase } = require('./fixtures/db')

beforeEach(setupDatabase)

test('Should signup a new user', async () => {
    const response = await request(app)
        .post('/users')
        .send({
            name: 'Test User',
            email: 'testuser@testing.com',
            password: 'SomeRandomString'
        }).expect(201)

    // Assert that the database was changed correctly
    const user = await User.findById(response.body.user._id)
    expect(user).not.toBeNull()

    // Assertions about the response
    // expect(response.body.user.name).toBe('Test User')
    expect(response.body).toMatchObject({
        user: {
            name: 'Test User',
            email: 'testuser@testing.com'
        },
        token: user.tokens[0].token
    })
})

test('Should log existing user in', async () => {
    const response = await request(app)
        .post('/users/login')
        .send({
            email: userOne.email,
            password: userOne.password
        }).expect(200)
    const user = await User.findById(userOne._id)
    expect(response.body.token).toBe(user.tokens[1].token)
})

test('Should not login nonexistent user', async () => {
    await request(app)
        .post('/users/login')
        .send({
            email: 'icaspian@outlook.com',
            password: 'whatareYOuDoin'
        }).expect(400)
})

test('Should get user profile', async () => {
    await request(app)
        .get('/users/profile')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send().expect(200)
})

test('Should not get profile for anonymous user', async () => {
    await request(app)
        .get('/users/profile')
        .send().expect(401)
})

test('Should delete user profile', async () => {
    const response = await request(app)
        .delete('/users/profile')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send().expect(200)
    const user = await User.findById(userOne._id)
    expect(user).toBeNull()
})

test('Should not delete anonymous user profile', async () => {
    await request(app)
        .delete('/users/profile')
        .send().expect(401)
})

test('Should upload avatar', async () => {
    await request(app)
        .post('/users/profile/avatar')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .attach('avatar', 'tests/fixtures/profile-pic.jpg').expect(200)
    const user = await User.findById(userOne._id)
    expect(user.avatar).toEqual(expect.any(Buffer))
})

test('Should update valid user fields', async () => {
    await request(app)
        .patch('/users/profile')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            name: 'Test \'updated\' UserOne'
        }).expect(200)
    const user = await User.findById(userOne._id)
    expect(user.name).toBe('Test \'updated\' UserOne')
})

test('Should not update invalid user fields', async () => {
    await request(app)
        .patch('/users/profile')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            location: 'Nigeria'
        }).expect(403)
})
