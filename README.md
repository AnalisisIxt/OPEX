<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1lnUMeToZ9XeQxhKmfy2gFpUjCQilPUye

## Ejecución Local

**Requisitos:** Node.js

1. **Instalar dependencias:**
   `npm install`
2. **Configurar [.env.local](.env.local):**
   Debes agregar las siguientes claves:
   - `VITE_SUPABASE_URL`: Tu URL del proyecto en Supabase
   - `VITE_SUPABASE_ANON_KEY`: Tu clave anónima (Anon Key)
   - `VITE_GEMINI_API_KEY`: Tu clave de Google Gemini
3. **Iniciar la aplicación:**
   `npm run dev`
