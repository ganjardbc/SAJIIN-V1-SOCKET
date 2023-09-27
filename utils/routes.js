'use strict';

class Routes{

    constructor(app,socket){
        this.app = app;
        this.io = socket;

        /* 
            Array to store the list of users along with there respective socket id.
        */        
       this.users = [];
       this.shops = [];
    }


    appRoutes(){

        this.app.get('/', (request,response) => {
            response.render('index');
        });

    }

    socketEvents(){

        this.io.on('connection', (socket) => {

            console.log('>> user connected :', socket.id)

            // USERS
            socket.on('addUser', (data) => {
                const findUserId = this.users.find((item) => item.id === socket.id)

                if (!findUserId) {
                    this.users.push({
                        socketId: socket.id,
                        ...data
                    })

                    this.io.emit('userList', this.users)
                }
            })

            // SHOPS
            socket.on('addShop', (data) => {
                const findShopId = this.shops.find((item) => item.socketId === socket.id && item.shopId === data.shopId)

                if (!findShopId && data) {
                    this.shops.push({
                        socketId: socket.id,
                        ...data
                    })

                    this.io.emit('shopList', this.shops)
                }
            })

            socket.on('removeShop', (data) => {
                const findShopIndex = this.shops.findIndex((item) => item.socketId === data.socketId && item.shopId === data.shopId)

                if (findShopIndex > 0) {
                    this.shops.splice(findShopIndex, 1)

                    this.io.emit('shopList', this.shops)
                }
            })

            // NOTIFICATIONS
            socket.on('notification', (data) => {
                for (let i = 0; i < this.shops.length; i++) {
                    const shop = this.shops[i]
                    if (shop.shopId === data.shopId) {
                        const payload = {
                            ...data,
                            message: `Ada pesanan baru (${data.orderId})`
                        }
                        socket.broadcast.to(shop.socketId).emit('notification', payload)
                    }                    
                }
            })

            // DISCONNECT
            socket.on('disconnect',() => {
                
                for(let i = 0; i < this.users.length; i++){
                    
                    if(this.users[i].id === socket.id){
                        this.users.splice(i,1); 
                    }
                }

                this.io.emit('exit',this.users); 
            });
        });

    }

    routesConfig(){
        this.appRoutes();
        this.socketEvents();
    }
}
module.exports = Routes;