import app from './app';

const PORT = process.env.PORT ?? 4000;

app.listen(PORT, () => {
  console.log(`Emoclew backend running on http://localhost:${PORT} [${process.env.NODE_ENV ?? 'development'}]`);
});