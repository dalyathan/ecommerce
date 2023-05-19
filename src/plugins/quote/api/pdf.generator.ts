import * as fs from 'fs';
import { file } from 'tmp';
const pdf = require('pdf-creator-node')
import template from './pdf_template';
import crypto from 'crypto'
/*

: {location_text: "Addis Ababa, Bole", made_out_email: "ebenezertesfaye@yahoo.com", made_out_phone: "+251912701156",
                  product_title: "Test Product, koche, dsidnsjfndf,ndisdjsd".toUpperCase(), q_ref: "dsdbu232endsdsd", subject: "Decrease cost", date: "11/11/12", admin: "Ebenbe",
                  sub_total: "11.2",
                  general_terms: "Nothing to see here man!",
                  tax: "112",
                  discount: "102",
                  shipping_cost: "",
                  i_t: "11000",
                  comm_bank: "1000323232",
                  dashen: "323232323",
                  tele_birr: "dsddsc",
                  grand_total: "10000",
                  access: [{name: "Fokisa", price: "100.2"}, {name: "Fokisa", price: "100.2", descr: "Literally a person."},{name: "Fokisa", price: "100.2", descr: "Literally a person."}],
                  products: [
                    {quantity: 10, ref: "3rdadgwqr2qwdss", sku: "dsdy39h8donsjd", descr: "This is a tool.", price: 299.99},
                    {quantity: 10, ref: "3rdadgwqr2qwdss", sku: "dsdy39h8donsjd", descr: "This is a tool.", price: 299.99},
                    {quantity: 10, ref: "3rdadgwqr2qwdss", sku: "dsdy39h8donsjd", descr: "This is a tool.", price: 299.99},
                    {quantity: 10, ref: "3rdadgwqr2qwdss", sku: "dsdy39h8donsjd", descr: "This is a tool.", price: 299.99},

                  ]
         },
*/


let o = {
    format: "A3",
    orientation: "portrait",
    border: "10mm",
    childProcessOptions: {
      env: {
        OPENSSL_CONF: '/dev/null',
      },
    }
};


function randName(){
    const n = crypto.randomBytes(32).toString("hex");
    return n+'.pdf';
}
export  async function genPdfFromHtml(data){
      
        const fileName = "./static/assets/quotes/"+randName();
        var document = {
            html: template.replace('{{general_terms}}', data['general_terms']),
            data,
            path: fileName,
            type: "",
          };
          
        // let htmlVersion= pdf
       
       await pdf.create(document, o)
       return `${fileName.split('/static')[1]}`;
}





// console.log('hello')


