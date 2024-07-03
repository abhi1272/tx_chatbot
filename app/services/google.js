const { GoogleAuth } = require("google-auth-library");

async function getAccessToken() {
  const auth = new GoogleAuth({
    credentials: {
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      project_id: process.env.GOOGLE_PROJECT_ID,
      private_key: '-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDK0B5LZ1W+ZaQ8\nF7/P2QzPAAIxf6AV4UrMg/WX7zlhGwlYSbSv6MjFODIt8Xw2rsrx1KjtbbXzo6Wr\naKdIJkJtSm0KW5Wp1og/KBlADYaVC8r7IYoMi9fqv+B3NnZGGQhwW068rKzMxzrT\n0u0z7WNGjBNXf+gqdpjN6ff8wVqZn6gHF5ijzX55NaM6YZpJN/cYtY/viRB/93eU\nfZD+uKN/M/+0MqNf/KCGo/y4hQTadLzgmkzYQAMZbt69CvuZc6nQEqKA9PjhrGpx\nSaDWiy0+rhT0m4QRPqgvxEo/Mn/MGB7Js5Su3ObTgDdzEbWabQvTlgYRGqhuOV+y\n6fnbBnYNAgMBAAECggEAJ4PvMx/aG/Ov0SmLbNLMZRSKWNyV801nBnv7gPPSSTI8\nWuBZfSCs5YgydrMjUYAy+HVHyKLknajX4ZLNbQhPTv3+StNXULUE7NFCQjGgdC/N\nB6scO5+PnSRvdqq81qGP/Fw99hLqxCdZNeZV4xUwj5FBP34jXQqocQ5SDAQcQ+v3\nQfGgk7sp2xKcV3KzxRTBVMJcL2ZgtZLCiwcY9SQ8tsUrZk64lRP7CO2qVn9yeI4P\nzMudSaTRq2eM0ATk765Z9RHhV0Q7zRwSHqU2XEheV4rj0o7jEviv1aS70OgQZkzZ\nHAof6WTMHH1JyzNYuCLtDz/06pNhV5WDLGqZkVClXQKBgQD9tIntZ6oV/4jWfmjK\nlVxZENRDStwBcfhxV/pJH/AM622uER2EctoQdEi5ApPEk7QqV3PLAGodd5bY1LKn\nuKigj38Q98VgcztMhOq2PWrW3motMsUXdiIKrFukkP9CXy8ri75plkC4aDqrp71m\nYHs4DUBkkPnCOtV+UVJXiKjx4wKBgQDMpby2X+4gmLNoT1PynIfoBQoUSqWO9ybH\nP4HbiwltmQy+/gpWPop44JocgzQsfQh1m8mKVqkaLMvE4PP3KXvAWOYKPstUzP5Q\nc40wN4PtFTLllTxCGxYku/RQ9mW8ch4cWAQgI6SC6v41J5cIXXUuc2nRAUFcBt1/\n8ljxS3G7TwKBgBDFGkjjDU8e8QCconihntUUU7OPAzPlQLLdSeIDhm6UMU/MOdND\ndD6aMSRpkzLvQH18Al9sy5bfDM2QYa7MefkDAzcv6ZASjdzk/E7HiIRjd0k9jeGb\nIWzrL7OVEgplGE0ck52PHQATg61NDSvzPLHbzmHXY2r/UJVk8rhuhBxZAoGBAIhH\n2qrsqUxlxBuzsCjBWrQFHxgyOZxCND29qgGEzouAv38097dFQLuMfrR8HzN9NDP1\nwbnxSf1XVX9PesfehT2rNc4e0RMwzC7RNHWmkqFAW7uNrSoslYty6xk7bLaYnDqt\n1ll8wuI4EX9eVPLKIe4EB7SajGb3X2wD/Hz7i8p7AoGANi+3kWIp5vgdqE2kg2yn\nNCmCWcnEKrhRLY67Duwepvmd4uNnOCnGy386cufZHWy4gmDD1nZv1pfXjkNZeNsV\nf71TOZC6AQU9VxwoYKN9tcU+/hsQ+XrEwrIakwOJmQq76GKPnLd5C5Hva6bu/skT\nL1h5Wm0sbg1uDYxDwcBvboU=\n-----END PRIVATE KEY-----\n',
    },
    scopes: "https://www.googleapis.com/auth/cloud-platform",
  });
  const client = await auth.getClient();
  const accessToken = await client.getAccessToken();
  return accessToken;
}

module.exports = { getAccessToken };
