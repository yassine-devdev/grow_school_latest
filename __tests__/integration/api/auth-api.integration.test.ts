import { TestDatabase, setupTestDatabase, cleanupTestDatabase } from '../../utils/test-database';
import { ApiTestClient, createApiTestClient } from '../../utils/api-test-client';
import { nanoid } from 'nanoid';

describe('Authentication API Integration Tests', () => {
    let testDb: TestDatabase;
    let apiClient: ApiTestClient;

    beforeAll(async () => {
        testDb = await setupTestDatabase();
        apiClient = createApiTestClient();
    });

    afterAll(async () => {
        await cleanupTestDatabase(testDb);
    });

    beforeEach(async () => {
        // Clean up any test data before each test
        await testDb.clearUsers();
    });

    describe('POST /api/auth/register', () => {
        it('should register a new user successfully', async () => {
            const userData = {
                email: `test-${nanoid()}@example.com`,
                password: 'SecurePassword123!',
                name: 'Test User'
            };

            const response = await apiClient.post('/api/auth/register', userData);

            expect(response.status).toBe(201);
            expect(response.data).toMatchObject({
                user: {
                    email: userData.email,
                    name: userData.name
                }
            });
            expect(response.data.user.password).toBeUndefined();
            expect(response.data.token).toBeDefined();
        });

        it('should reject registration with invalid email', async () => {
            const userData = {
                email: 'invalid-email',
                password: 'SecurePassword123!',
                name: 'Test User'
            };

            const response = await apiClient.post('/api/auth/register', userData);

            expect(response.status).toBe(400);
            expect(response.data.error).toContain('email');
        });

        it('should reject registration with weak password', async () => {
            const userData = {
                email: `test-${nanoid()}@example.com`,
                password: '123',
                name: 'Test User'
            };

            const response = await apiClient.post('/api/auth/register', userData);

            expect(response.status).toBe(400);
            expect(response.data.error).toContain('password');
        });

        it('should reject duplicate email registration', async () => {
            const userData = {
                email: `test-${nanoid()}@example.com`,
                password: 'SecurePassword123!',
                name: 'Test User'
            };

            // First registration
            await apiClient.post('/api/auth/register', userData);

            // Attempt duplicate registration
            const response = await apiClient.post('/api/auth/register', userData);

            expect(response.status).toBe(409);
            expect(response.data.error).toContain('already exists');
        });
    });

    describe('POST /api/auth/login', () => {
        beforeEach(async () => {
            // Create a test user for login tests
            await apiClient.post('/api/auth/register', {
                email: 'login-test@example.com',
                password: 'SecurePassword123!',
                name: 'Login Test User'
            });
        });

        it('should login with valid credentials', async () => {
            const loginData = {
                email: 'login-test@example.com',
                password: 'SecurePassword123!'
            };

            const response = await apiClient.post('/api/auth/login', loginData);

            expect(response.status).toBe(200);
            expect(response.data).toMatchObject({
                user: {
                    email: loginData.email,
                    name: 'Login Test User'
                }
            });
            expect(response.data.user.password).toBeUndefined();
            expect(response.data.token).toBeDefined();
        });

        it('should reject login with invalid email', async () => {
            const loginData = {
                email: 'nonexistent@example.com',
                password: 'SecurePassword123!'
            };

            const response = await apiClient.post('/api/auth/login', loginData);

            expect(response.status).toBe(401);
            expect(response.data.error).toContain('Invalid credentials');
        });

        it('should reject login with invalid password', async () => {
            const loginData = {
                email: 'login-test@example.com',
                password: 'WrongPassword123!'
            };

            const response = await apiClient.post('/api/auth/login', loginData);

            expect(response.status).toBe(401);
            expect(response.data.error).toContain('Invalid credentials');
        });

        it('should reject login with missing fields', async () => {
            const response = await apiClient.post('/api/auth/login', {
                email: 'login-test@example.com'
                // Missing password
            });

            expect(response.status).toBe(400);
            expect(response.data.error).toContain('required');
        });
    });

    describe('POST /api/auth/logout', () => {
        let authToken: string;

        beforeEach(async () => {
            // Register and login to get a token
            const registerResponse = await apiClient.post('/api/auth/register', {
                email: `logout-test-${nanoid()}@example.com`,
                password: 'SecurePassword123!',
                name: 'Logout Test User'
            });
            authToken = registerResponse.data.token;
        });

        it('should logout successfully with valid token', async () => {
            const response = await apiClient.post('/api/auth/logout', {}, {
                headers: { Authorization: `Bearer ${authToken}` }
            });

            expect(response.status).toBe(200);
            expect(response.data.message).toContain('logged out');
        });

        it('should reject logout without token', async () => {
            const response = await apiClient.post('/api/auth/logout', {});

            expect(response.status).toBe(401);
            expect(response.data.error).toContain('token');
        });

        it('should reject logout with invalid token', async () => {
            const response = await apiClient.post('/api/auth/logout', {}, {
                headers: { Authorization: 'Bearer invalid-token' }
            });

            expect(response.status).toBe(401);
            expect(response.data.error).toContain('token');
        });
    });

    describe('GET /api/auth/me', () => {
        let authToken: string;
        let userEmail: string;

        beforeEach(async () => {
            userEmail = `me-test-${nanoid()}@example.com`;
            const registerResponse = await apiClient.post('/api/auth/register', {
                email: userEmail,
                password: 'SecurePassword123!',
                name: 'Me Test User'
            });
            authToken = registerResponse.data.token;
        });

        it('should return user profile with valid token', async () => {
            const response = await apiClient.get('/api/auth/me', {
                headers: { Authorization: `Bearer ${authToken}` }
            });

            expect(response.status).toBe(200);
            expect(response.data.user).toMatchObject({
                email: userEmail,
                name: 'Me Test User'
            });
            expect(response.data.user.password).toBeUndefined();
        });

        it('should reject request without token', async () => {
            const response = await apiClient.get('/api/auth/me');

            expect(response.status).toBe(401);
            expect(response.data.error).toContain('token');
        });

        it('should reject request with invalid token', async () => {
            const response = await apiClient.get('/api/auth/me', {
                headers: { Authorization: 'Bearer invalid-token' }
            });

            expect(response.status).toBe(401);
            expect(response.data.error).toContain('token');
        });
    });

    describe('POST /api/auth/refresh', () => {
        let refreshToken: string;

        beforeEach(async () => {
            const registerResponse = await apiClient.post('/api/auth/register', {
                email: `refresh-test-${nanoid()}@example.com`,
                password: 'SecurePassword123!',
                name: 'Refresh Test User'
            });
            refreshToken = registerResponse.data.refreshToken;
        });

        it('should refresh token with valid refresh token', async () => {
            const response = await apiClient.post('/api/auth/refresh', {
                refreshToken
            });

            expect(response.status).toBe(200);
            expect(response.data.token).toBeDefined();
            expect(response.data.refreshToken).toBeDefined();
        });

        it('should reject refresh with invalid token', async () => {
            const response = await apiClient.post('/api/auth/refresh', {
                refreshToken: 'invalid-refresh-token'
            });

            expect(response.status).toBe(401);
            expect(response.data.error).toContain('refresh token');
        });

        it('should reject refresh without token', async () => {
            const response = await apiClient.post('/api/auth/refresh', {});

            expect(response.status).toBe(400);
            expect(response.data.error).toContain('required');
        });
    });
});

