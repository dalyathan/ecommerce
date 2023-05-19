import { NgModule } from '@angular/core';
import {DocumentationProductCustomFieldComponent} from './components/documentation.product.custom-field.component';
import { SharedModule, registerFormInputComponent, RichTextFormInputComponent } from '@etech/admin-ui/package/core';
import { AdminPhoneNumberComponent } from './components/phone-number.administrator.custom-field.component';
import {ProductAccessoriesCustomFieldComponent} from './components/product-accessories/accessories.product.custom-field.component';
import { AdminFulfillmentFieldComponent } from './components/admin-fulfillment/admin-fulfillment.component';
import {AdminSignatureComponent} from './components/signature.administrator.custom-field.component';
import { CancelOrderAfterGlobalSettingComponent } from './components/cancel-order-after.component';
import { UpdateBestSellersEveryGlobalSettingComponent } from './components/update-best-sellers-every.component';
import { AllowCustomerPaymentOrderCustomFieldComponent } from './components/allow-customer-payment.order.custom-field.component';
import { ProductDocComponent } from './components/upload-doc.component';
import { DimensionsProductVariantCustomFieldComponent } from './components/dimensions.product-variant.custom-field.component';
@NgModule({
    imports: [SharedModule],
    declarations: [ProductDocComponent, DocumentationProductCustomFieldComponent, AdminFulfillmentFieldComponent, CancelOrderAfterGlobalSettingComponent,
    AdminSignatureComponent, UpdateBestSellersEveryGlobalSettingComponent, ProductAccessoriesCustomFieldComponent,
    AllowCustomerPaymentOrderCustomFieldComponent, DimensionsProductVariantCustomFieldComponent],
    providers: [
        registerFormInputComponent('product-doc', DocumentationProductCustomFieldComponent),
        registerFormInputComponent('rich-text-editor', RichTextFormInputComponent),
        registerFormInputComponent('accessories', ProductAccessoriesCustomFieldComponent),
        registerFormInputComponent('admin-fulfillment-field', AdminFulfillmentFieldComponent),
        registerFormInputComponent('admin-phone-field', AdminPhoneNumberComponent),
        registerFormInputComponent('admin-signature-field', AdminSignatureComponent),
        registerFormInputComponent('cancel-order-after', CancelOrderAfterGlobalSettingComponent),
        registerFormInputComponent('update-best-sellers-every', UpdateBestSellersEveryGlobalSettingComponent),
        registerFormInputComponent('allow-customer-payment', AllowCustomerPaymentOrderCustomFieldComponent),
        registerFormInputComponent('dimensions', DimensionsProductVariantCustomFieldComponent),
    ],
    exports:[
        // ProtectedFileAccessService
    ]
})
export class AddonsSharedExtensionModule {}