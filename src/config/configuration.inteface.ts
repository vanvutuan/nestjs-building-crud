interface DbConfig {
  type: string;
  host: string;
  port: number;
  username: string;
  password: string;
  name: string;
}

interface AppConfig {
  port: string;
  env: string;
  logPath: string;
}
