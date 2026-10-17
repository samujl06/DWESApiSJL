export const swaggerSpec = {
  "openapi": "3.0.0",
  "info": {
    "title": "REST API - Tienda de Ropa",
    "version": "1.0.0",
    "description": "Las peticiones GET son públicas. POST, PUT y DELETE requieren token de acceso (botón Authorize). Límite: 100 peticiones cada 15 minutos por IP."
  },
  "components": {
    "securitySchemes": {
      "bearerAuth": {
        "type": "http",
        "scheme": "bearer",
        "bearerFormat": "JWT"
      }
    },
    "parameters": {
      "id": {
        "name": "id",
        "in": "path",
        "required": true,
        "schema": {
          "type": "integer"
        }
      }
    },
    "schemas": {
      "Auth": {
        "type": "object",
        "properties": {
          "nombre": { "type": "string", "example": "Samu" },
          "password": { "type": "string", "example": "123456" }
        }
      },
      "User": {
        "type": "object",
        "properties": {
          "nombre": { "type": "string", "example": "Ana" },
          "edad": { "type": "integer", "example": 22 },
          "password": { "type": "string", "example": "123456" }
        }
      },
      "Clothing": {
        "type": "object",
        "properties": {
          "nombre": { "type": "string", "description": "Nombre de la prenda", "example": "Camiseta Oversize Algodón" },
          "marca": { "type": "string", "description": "Marca", "example": "Nike" },
          "categoria": { "type": "string", "description": "Categoría de ropa", "example": "Camisetas" },
          "talla": { "type": "string", "description": "Talla de la prenda", "example": "M" },
          "color": { "type": "string", "description": "Color principal", "example": "Negro" },
          "precio": { "type": "number", "description": "Precio en euros", "example": 29.99 },
          "stock": { "type": "integer", "description": "Unidades disponibles", "example": 50 }
        }
      },
      "RefreshToken": {
        "type": "object",
        "properties": {
          "refreshToken": { "type": "string", "example": "eyJhbGciOi..." }
        }
      }
    }
  },
  "paths": {
    "/api/login": {
      "post": {
        "summary": "Iniciar sesión (devuelve accessToken y refreshToken)",
        "tags": ["Autenticación"],
        "requestBody": { "content": { "application/json": { "schema": { "$ref": "#/components/schemas/Auth" } } } },
        "responses": {
          "200": { "description": "accessToken (15 min) y refreshToken (7 días)" },
          "401": { "description": "Usuario o contraseña incorrectos" }
        }
      }
    },
    "/api/refresh": {
      "post": {
        "summary": "Obtener un nuevo access token usando el refresh token",
        "tags": ["Autenticación"],
        "requestBody": { "content": { "application/json": { "schema": { "$ref": "#/components/schemas/RefreshToken" } } } },
        "responses": {
          "200": { "description": "Nuevo accessToken" },
          "401": { "description": "Refresh token inválido o expirado" }
        }
      }
    },
    "/api/users": {
      "get": {
        "summary": "Listar usuarios",
        "tags": ["Usuarios"],
        "responses": { "200": { "description": "Lista de usuarios" } }
      },
      "post": {
        "summary": "Crear un usuario",
        "tags": ["Usuarios"],
        "security": [{ "bearerAuth": [] }],
        "requestBody": { "content": { "application/json": { "schema": { "$ref": "#/components/schemas/User" } } } },
        "responses": {
          "201": { "description": "Usuario creado" },
          "401": { "description": "Token inválido" },
          "409": { "description": "El usuario ya existe" }
        }
      }
    },
    "/api/users/{id}": {
      "get": {
        "summary": "Obtener un usuario",
        "tags": ["Usuarios"],
        "parameters": [{ "$ref": "#/components/parameters/id" }],
        "responses": {
          "200": { "description": "Usuario" },
          "404": { "description": "No encontrado" }
        }
      },
      "put": {
        "summary": "Actualizar un usuario",
        "tags": ["Usuarios"],
        "security": [{ "bearerAuth": [] }],
        "parameters": [{ "$ref": "#/components/parameters/id" }],
        "requestBody": { "content": { "application/json": { "schema": { "$ref": "#/components/schemas/User" } } } },
        "responses": {
          "200": { "description": "Usuario actualizado" },
          "401": { "description": "Token inválido" }
        }
      },
      "delete": {
        "summary": "Eliminar un usuario",
        "tags": ["Usuarios"],
        "security": [{ "bearerAuth": [] }],
        "parameters": [{ "$ref": "#/components/parameters/id" }],
        "responses": {
          "200": { "description": "Usuario eliminado" },
          "401": { "description": "Token inválido" }
        }
      }
    },
    "/api/ropa": {
      "get": {
        "summary": "Listar prendas de ropa del catálogo",
        "tags": ["Ropa"],
        "responses": { "200": { "description": "Lista de prendas de ropa" } }
      },
      "post": {
        "summary": "Añadir una prenda de ropa",
        "tags": ["Ropa"],
        "security": [{ "bearerAuth": [] }],
        "requestBody": { "content": { "application/json": { "schema": { "$ref": "#/components/schemas/Clothing" } } } },
        "responses": {
          "201": { "description": "Prenda añadida" },
          "401": { "description": "Token inválido" }
        }
      }
    },
    "/api/ropa/{id}": {
      "get": {
        "summary": "Obtener una prenda de ropa",
        "tags": ["Ropa"],
        "parameters": [{ "$ref": "#/components/parameters/id" }],
        "responses": {
          "200": { "description": "Prenda de ropa" },
          "404": { "description": "No encontrada" }
        }
      },
      "put": {
        "summary": "Actualizar una prenda de ropa",
        "tags": ["Ropa"],
        "security": [{ "bearerAuth": [] }],
        "parameters": [{ "$ref": "#/components/parameters/id" }],
        "requestBody": { "content": { "application/json": { "schema": { "$ref": "#/components/schemas/Clothing" } } } },
        "responses": {
          "200": { "description": "Prenda actualizada" },
          "401": { "description": "Token inválido" }
        }
      },
      "delete": {
        "summary": "Eliminar una prenda de ropa",
        "tags": ["Ropa"],
        "security": [{ "bearerAuth": [] }],
        "parameters": [{ "$ref": "#/components/parameters/id" }],
        "responses": {
          "200": { "description": "Prenda eliminada" },
          "401": { "description": "Token inválido" }
        }
      }
    }
  }
};