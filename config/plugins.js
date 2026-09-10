// Strapi v4.16.2 email config (plan A: Gmail SMTP).
// Default = sendmail (built into prawee/strapi image) so container still boots
// without extra install. Set EMAIL_PROVIDER=nodemailer + install provider to use Gmail.
//
// How the provider gets into the container (durable across `up -d` recreates):
//   1. On the HOST: npm install --no-save --prefix email-extra @strapi/provider-email-nodemailer@4.16.2
//      (pure JS, safe on Windows; lands in email-extra/node_modules, gitignored)
//   2. docker-compose.yaml bind-mounts those dirs over /opt/node_modules/... (:ro)
// NEVER `npm install --prefix /opt` inside the container — it prunes
// /opt/node_modules and breaks Strapi (had to re-pull the image once to recover).
//
// Gmail needs an App Password (16 chars), NOT the normal login password:
// Google Account > Security > 2-Step Verification ON > App passwords.

module.exports = ({ env }) => {
  const provider = env('EMAIL_PROVIDER', 'sendmail');

  return {
    email: {
      config: {
        provider,
        providerOptions:
          provider === 'nodemailer'
            ? {
                host: env('EMAIL_SMTP_HOST', 'smtp.gmail.com'),
                port: env.int('EMAIL_SMTP_PORT', 587),
                secure: false,
                auth: {
                  user: env('EMAIL_SMTP_USER'),
                  pass: env('EMAIL_SMTP_PASS'),
                },
              }
            : {},
        settings: {
          defaultFrom: env('EMAIL_FROM', 'no-reply@localhost'),
          defaultReplyTo: env(
            'EMAIL_REPLY_TO',
            env('EMAIL_FROM', 'no-reply@localhost')
          ),
        },
      },
    },
  };
};
