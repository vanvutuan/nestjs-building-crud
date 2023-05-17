export default () => ({
    application: {
        port: parseInt(process.env.PORT, 10),
        env: process.env.NODE_ENV,
    },
    database: {
        host: process.env.DATABASE_HOST,
        port: parseInt(process.env.DATABASE_PORT, 10),
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        name: process.env.DB_NAME,
    }
});