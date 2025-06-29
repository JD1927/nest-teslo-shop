export default () => ({
  environment: process.env.NODE_ENV || 'dev',
  port: process.env.PORT || 3000,
  db_name: process.env.DB_NAME || 'teslo_db',
  db_password: process.env.DB_PASSWORD,
  db_host: process.env.DB_HOST || 'localhost',
  db_port: +(process.env.DB_PORT || '5432'),
  db_username: process.env.DB_USERNAME || 'postgres',
  jwt_secret: process.env.JWT_SECRET,
});
