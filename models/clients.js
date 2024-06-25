const mysql = require('../config/mysql');

const saveClient = async (data) => {
    const{
        telefono,
        nombre
    }=data
    const query = `INSERT INTO clientes (telefono, nombre) VALUES (${mysql.escape(telefono)}, ${mysql.escape(nombre)})`;
    const result = new Promise((resolve, reject) => {
        return mysql.query(query, (err, result) => {
            if (err) {
                console.log('Error al guardar cliente', err);
                reject(err)
            }
            resolve(result)
        })
    })
    return result
} 

const getClient = async (telefono) => {
    const query = `SELECT * FROM clientes WHERE telefono = ${mysql.escape(telefono)}`;
    const result = new Promise((resolve, reject) => {
        return mysql.query(query, (err, result) => {
            if (err) {
                console.log('Error al obtener cliente', err);
                reject(err)
            }
            resolve(result)
        })
    })
    return result
}

const saveHistorial = async (data) => {
    const {
        client_id,
        mensaje
    } = data 
    const query = `INSERT INTO historial (cliente_id, mensaje) VALUES (${mysql.escape(client_id)}, ${mysql.escape(mensaje)})`;
    const result = new Promise((resolve, reject) => {
        return mysql.query(query, (err, result) => {
            if (err) {
                console.log('Error al obtener historial', err);
                reject(err)
            }
            resolve(result)
        })
    })
    return result
}

const verifyStoreClient = async (telefono, nombre, mensaje) =>{
    const client = await getClient(telefono);
    if (!client.length) {
        const savePayload ={
            telefono,
            nombre
        }
        await saveClient(savePayload);
        
    }else{
        const historialPayload = {
            client_id: client[0].id,
            mensaje
        }
        await saveHistorial(historialPayload);
    }
    return null
}

module.exports = { verifyStoreClient}

