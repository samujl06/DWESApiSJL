import express from "express";
import cors from "cors";
import bcrypt from "bcryptjs"  // Hashing de contraseñas
import jwt from "jsonwebtoken" // Generacion y verificacion de tokens
import swaggerUi from "swagger-ui-express"
import swaggerDocument from "./openapi.json" with { type: "json" }
// Para que swagger funcione correctamente en Vercel es necesario archivo vercel.json
// y añadir configuración indicada en https://github.com/swagger-api/swagger-ui/issues/9924#issuecomment-3360835086


const SECRET_KEY = "secreto"                 // Secreto para firmar el Access Token
const REFRESH_SECRET_KEY = "secreto-refresh" // Secreto para firmar el Refresh Token
const app = express()


let Users = [
    { id: 0, nombre: "Samu", edad: 20, password: "$2b$10$9NjGG53sbqo0JlSjGf/siek.jQUC4Uvzw9Kc3jNVl7KE7dmcV.QB." }, // password: 123456
    { id: 1, nombre: "Ana", edad: 25, password: "$2b$10$l/.WxXkTG6pKVB7KYU/KROXVvH7nAQqyrsq5PW1b.1X4v6L2u00u2" }, // password: ana
    { id: 2, nombre: "Eva", edad: 28, password: "$2b$10$TW/qH6MQ/fd4sRijnHIdoekydhtIonurDMvxZHgqNaIR4st2A90Xe" }  // password: eva
]

let Ropa = [
    { id: 0, tipo: "Camiseta", marca: "Nike", talla: "M", color: "Negro", material: "Algodón", precio: 19.99, stock: 35 },
    { id: 1, tipo: "Pantalón", marca: "Levi's", talla: "L", color: "Azul", material: "Denim", precio: 59.9, stock: 20 }
]

// Array para almacenar los refresh tokens activos (en memoria)
let refreshTokens = []


app.use(express.json())   // IMPORTANTE
app.use(cors())           // Para habilitar CORS
app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerDocument)
)



function verifyToken(request, response, next) {
    const token = request.headers.authorization?.split(" ")[1]; // formato "Bearer <token>"

    if (!token) return response.status(403).json({ message: "Token requerido" });

    try {
        request.user = jwt.verify(token, SECRET_KEY);
        next();
    } catch (err) {
        return response.status(403).json({ message: "Token inválido o expirado" });
    }
}


// Redirigir a la documentación de la API
app.get("/", (request, response) => response.redirect("/api-docs"))


// LOGIN
app.post('/api/login', async (request, response) => {
    if (!request.is('json'))
        return response.json({ message: 'Debes proporcionar datos JSON' })

    const { nombre, password } = request.body

    const user = Users.find(u => u.nombre == nombre)

    if (user == undefined) {
        return response.json({ message: "Usuario no encontrado" })
    }

    // Comparamos la contraseña
    const correctPassword = await bcrypt.compare(password, user.password)

    if (!correctPassword) {
        return response.json({ message: "Contraseña incorrecta" })
    }

    const payload = { id: user.id, nombre: user.nombre }

    // Generamos el Access Token (corta duración: 5m)
    const token = jwt.sign(payload, SECRET_KEY, { expiresIn: '5m' })

    // Generamos el Refresh Token (larga duración: 7d)
    const refreshToken = jwt.sign(payload, REFRESH_SECRET_KEY, { expiresIn: '7d' })

    // Guardamos el refresh token en nuestra lista
    refreshTokens.push(refreshToken)

    // Devolvemos la estructura solicitada
    response.json({
        mensaje: "Inicio de sesión correcto",
        token,
        refreshToken
    })
})


// REFRESH TOKEN ENDPOINT
app.post('/api/refresh-token', (request, response) => {
    if (!request.is('json'))
        return response.json({ message: 'Debes proporcionar datos JSON' })

    const { refreshToken } = request.body

    if (!refreshToken) {
        return response.status(401).json({ message: "Refresh Token requerido" })
    }

    if (!refreshTokens.includes(refreshToken)) {
        return response.status(403).json({ message: "Refresh Token inválido o ya revocado" })
    }

    jwt.verify(refreshToken, REFRESH_SECRET_KEY, (err, user) => {
        if (err) {
            return response.status(403).json({ message: "Refresh Token expirado o inválido" })
        }

        const payload = { id: user.id, nombre: user.nombre }
        const token = jwt.sign(payload, SECRET_KEY, { expiresIn: '5m' })

        response.json({ token })
    })
})


// LOGOUT
app.post('/api/logout', (request, response) => {
    const { refreshToken } = request.body
    refreshTokens = refreshTokens.filter(t => t !== refreshToken)
    response.json({ message: "Sesión cerrada correctamente" })
})


// -------------- USERS ------------------

// GET
app.get('/api/users', (request, response) => response.json(Users))

// GET 
app.get('/api/users/:id', (request, response) => {
    let user = Users.find(u => u.id == request.params.id)

    if (user !== undefined) {    
        return response.json(user)
    } else {
        response.json({ message: 'El elemento no ha sido encontrado' })
    }
})
 

// POST 
app.post('/api/users', verifyToken, async (request, response) => {
    if (!request.is('json'))
        return response.json({ message: 'Debes proporcionar datos JSON' })

    let sig = Users.length > 0 ? Math.max(...Users.map(u => u.id)) + 1 : 0

    const { nombre, edad, password } = request.body
    const hashedPassword = await bcrypt.hash(password, 10)
    Users.push({ id: sig, nombre, edad, password: hashedPassword })
    return response.json(Users)
})


// PUT
app.put('/api/users/:id', verifyToken, (request, response) => {
    if (!request.is('json'))
        return response.json({ message: 'Debes proporcionar datos JSON' })

    const { id } = request.params
    const { nombre, edad } = request.body

    const pos = Users.findIndex(u => u.id == id)

    if (pos != -1) {
        const password = Users[pos].password
        Users.splice(pos, 1, { id: Number(id), nombre, edad, password })
        return response.json(Users)
    } else {
        response.json({ message: 'El elemento no ha sido encontrado' })
    }
})

// DELETE
app.delete('/api/users/:id', verifyToken, (request, response) => {
    const pos = Users.findIndex(u => u.id == request.params.id)

    if (pos != -1) {
        Users.splice(pos, 1)
        return response.json(Users)
    } else {
        response.json({ message: 'El elemento no ha sido encontrado' })
    }
})


// -------------- ROPA (tienda) ------------------

// GET
app.get('/api/ropa', (request, response) => response.json(Ropa))

// GET 
app.get('/api/ropa/:id', (request, response) => {
    let prenda = Ropa.find(r => r.id == request.params.id)

    if (prenda !== undefined) {    
        return response.json(prenda)
    } else {
        response.json({ message: 'El elemento no ha sido encontrado' })
    }
})


// POST 
app.post('/api/ropa', verifyToken, (request, response) => {
    if (!request.is('json'))
        return response.json({ message: 'Debes proporcionar datos JSON' })

    let sig = Ropa.length > 0 ? Math.max(...Ropa.map(r => r.id)) + 1 : 0

    const { tipo, marca, talla, color, material, precio, stock } = request.body
    Ropa.push({ id: sig, tipo, marca, talla, color, material, precio, stock })
    return response.json(Ropa)
})


// PUT
app.put('/api/ropa/:id', verifyToken, (request, response) => {
    if (!request.is('json'))
        return response.json({ message: 'Debes proporcionar datos JSON' })

    const { id } = request.params
    const { tipo, marca, talla, color, material, precio, stock } = request.body

    const pos = Ropa.findIndex(r => r.id == id)

    if (pos != -1) {
        Ropa.splice(pos, 1, { id: Number(id), tipo, marca, talla, color, material, precio, stock })
        return response.json(Ropa)
    } else {
        response.json({ message: 'El elemento no ha sido encontrado' })
    }
})

// DELETE
app.delete('/api/ropa/:id', verifyToken, (request, response) => {
    const pos = Ropa.findIndex(r => r.id == request.params.id)

    if (pos != -1) {
        Ropa.splice(pos, 1)
        return response.json(Ropa)
    } else {
        response.json({ message: 'El elemento no ha sido encontrado' })
    }
})

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
    console.log(`Servidor web iniciado en puerto: 3001`)
    console.log(`Documentación de Swagger disponible en: http://localhost:3001/api-docs`)
})

export default app