'use strict';

class Printer{

    constructor(app,socket){
        this.app = app;
        this.io = socket;
    }


    appRoutes(){

        this.app.get('/', (request,response) => {
            response.render('index');
        });

    }

    socketEvents(){

        this.io.on('connection', (socket) => {
            socket.on('printReceipt', (data) => {
                if (data) {
                    console.log('>> start printing receipt');

                    const escpos = require('escpos');
                    escpos.USB = require('escpos-usb');
                    const device  = new escpos.USB();
                    const options = { encoding: "GB18030" };
                    const printer = new escpos.Printer(device, options);

                    device.open(function(error){
                        if (error) {
                            console.log('there is an error', error)
                        } else {
                            // SHOP INFO
                            printer
                                .align('ct')
                                .text(data.shop.name)
                                .text(data.shop.location)
                                .text(`Phone: ${data.shop.phone || '-'}`)
                                .text(`Email: ${data.shop.email || '-'}`);
                            printer.control('LF');
                            
                            // ORDER INFO
                            printer
                                .align('lt')
                                .text(`Order-ID: ${data.order_id || '-'}`)
                                .text(`Date: ${data.created_at || '-'}`)
                                .text(`Customer: ${data.customer_name || '-'}`)
                                .text(`Table: ${data.table_name || '-'}`);
                            printer.control('LF');
                            
                            // PRODUCT INFO
                            const leftWidth = 0.50;
                            const rightWidth = 0.30;

                            printer.tableCustom(
                                [
                                    { text: 'Product(s)', align: "LEFT", width: leftWidth, style: 'B' },
                                    { text: 'Subtotal', align: "LEFT", width: rightWidth, style: 'B' }
                                ]);

                            for (let index = 0; index < data.details.length; index++) {
                                const element = data.details[index];
                                printer
                                    .tableCustom(
                                        [
                                            { text: `${element.product_name || '-'}`, align: "LEFT", width: leftWidth },
                                            { text: '', align: "LEFT", width: rightWidth }
                                        ])
                                    .tableCustom(
                                        [
                                            { text: `${element.quantity || '-'} ${element.product_detail || '-'}`, align: "LEFT", width: leftWidth },
                                            { text: `x Rp.${element.subtotal || '-'}`, align: "LEFT", width: rightWidth }
                                        ]);
                            }

                            // TOTAL
                            printer.control('LF');
                            printer.tableCustom(
                                [
                                    { text: 'Total', align: "LEFT", width: leftWidth, style: 'B' },
                                    { text: `Rp.${data.total_price || '-'}`, align: "LEFT", width: rightWidth, style: 'B' }
                                ])
                                .tableCustom(
                                    [
                                        { text: 'Bills', align: "LEFT", width: leftWidth, style: 'B' },
                                        { text: `Rp.${data.bills_price || '-'}`, align: "LEFT", width: rightWidth, style: 'B' }
                                    ])    
                                .tableCustom(
                                    [
                                        { text: 'Change', align: "LEFT", width: leftWidth, style: 'B' },
                                        { text: `Rp.${data.change_price || '-'}`, align: "LEFT", width: rightWidth, style: 'B' }
                                    ]);
                            
                            // QR CODE
                            printer.control('LF');
                            printer
                                .align('ct')
                                .style('bu')
                                .font('b')
                                .text('Scan The QR-Code to Check This Orders')
                                .qrimage(`${data.order_id}`, function(err){
                                    this.cut();
                                    this.close();

                                    console.log('>> receipt has been printed');
                                });
                        }
                    });

                    this.io.emit('printReceipt', data);
                } else {
                    this.io.emit('printReceipt', 'data not found');
                }
            });
        });

    }

    routesConfig(){
        this.socketEvents();
    }
}
module.exports = Printer;