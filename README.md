Rentora is a rental management platform for heavy machinery, studio gear, and premium furniture, built with [Next.js](https://nextjs.org).

## Getting Started

The fastest way to run Rentora locally — installs dependencies, scaffolds `.env.local`, and starts the dev server in one step. Pick whichever fits your OS:

| Platform | Command |
| --- | --- |
| macOS / Linux | `./start.sh` |
| Windows (double-click, or `cmd`) | `start.bat` |
| Windows (PowerShell) | `./start.ps1` |
| Any OS with Node already set up | `npm run quickstart` |

Then open [http://localhost:3000](http://localhost:3000) (the script opens it for you automatically).

Want a production build instead of the dev server? Use `npm run quickstart:prod`, or pass `build` to the launcher (e.g. `./start.sh build`).

### Manual setup

If you'd rather run the steps yourself:

```bash
npm install
cp .env.local.example .env.local   # optional — omit for demo-payment mode
npm run dev
```

The SQLite database (`.data/luxrent.db`) is created and seeded automatically on first run — no separate migration step needed.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
