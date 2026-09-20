import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const backend = {
    target: 'https://localhost:7138',
    changeOrigin: true,
    secure: false,
};

export default defineConfig({
    plugins: [react()],
    server: {
        proxy: {
            '/api': backend,
            '/add-building': backend,
            '/remove-building': backend,
        },
    },
});