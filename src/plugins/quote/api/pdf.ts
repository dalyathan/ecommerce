const pdf = require('pdf-creator-node')
import template from './template';
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
   
};


function randName(){
    const n = crypto.randomBytes(64).toString("hex");
    return n+'.pdf';
}
export  async function genPdfFromHtml(data){
      
        const fileName = "./src/static/assets/quotes/"+randName();
        //const inFileName = './q.html';
      
        //const template = await fs.promises.readFile(inFileName, "utf-8")
        
        var document = {
            html: template,
            data,
            path: fileName,
            type: "",
          };
        pdf
        .create(document, o)
        .then((res: any) => {
            // console.log("Completed :)");
        })
        .catch((error: Error) => {
            console.error(error);
        });
        //fs.promises.writeFile(fileName, template);
}





// console.log('hello')

