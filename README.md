# My Remix Stack

minimum remix setup just for me.

- Typescript
- [Prisma](https://www.prisma.io/docs) for ORM
- [remix-auth](https://github.com/sergiodxa/remix-auth) for Auth
- Linter and formatter with my favorite configurations.
- [Vitest](https://vitest.dev/guide/) for unit testing (not support component testing)
- [Cypress](https://docs.cypress.io/guides/end-to-end-testing/writing-your-first-end-to-end-test) for e2e testing
- [Fly.io](https://fly.io/docs/) for deployment

## Initial setup needed before developing apps

### 1. Check the cloned stack works right

1. run `docker compose run --rm --service-ports remix`, `npm run dev` and confirm you can access the app at `http://localhost:3000`
2. stop the dev server and `npm run validate`. Confirm that all of lint, typecheck, vitest and cypress runs and succeeded.

### 2. Delete unnecessary codes for your app

Some codes unnecessary for your development are included to check this stack works right.

You should remove these before writing any codes.

1. Delete all codes after line 13 in `prisma/schema.prisma`
2. Delete files and directories listed below:
    1. `prisma/migrations` directory
    2. `app/delete-this-sample.ts`
    3. `app/delete-this-sample.test.ts`
    4. this `README.md` if you want
