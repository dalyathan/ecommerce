import { jsPDF } from "jspdf";

// Default export is a4 paper, portrait, using millimeters for units
// const doc = new jsPDF();

// doc.text("Hello world!", 10, 10);
// doc.save("a4.pdf");


export function prepObject(title, object, doc){
    

    doc.text(`Title: ${title}`,10 ,10);
    
    let i=15;



    for(const propery in object){
        doc.text(propery, 10, i);
        i+=10;
    }
}

export function downloadObjects(items: {object: Object, title: string}[], downName: string){
    const doc = new jsPDF()
    for(const obj of items){
        prepObject(obj.title, obj.object, doc)
    }

    doc.save(downName)

}