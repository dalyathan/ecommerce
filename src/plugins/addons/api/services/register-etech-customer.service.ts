import { CustomerService, EventBus, isGraphQlErrorResult, RequestContext } from '@etech/core';
import {
    Injectable,
  } from '@nestjs/common';
import { CreateAddressInput, CreateCustomerInput, RegisterEtechCustomerInput, Success } from '../../generated-shop-types';
@Injectable()
export class RegisterEtechCustomerService{
    constructor(private customerService: CustomerService, private eventBus: EventBus){

    }
    async registerEtechCustomer(ctx: RequestContext, registerInput:RegisterEtechCustomerInput):Promise<Success>{
        let createCustomerInput:CreateCustomerInput={
            emailAddress: registerInput.email,
            firstName: registerInput.firstName,
            lastName: registerInput.lastName,
            // password: registerInput.password,
            phoneNumber: registerInput.phoneNumber,
            customFields: {
                job: registerInput.job,
                tin_number: registerInput.tin
            }
        }
        // try{
        let result= await this.customerService.create(ctx, createCustomerInput, registerInput.password);
        let customerAddressInput:CreateAddressInput={
            streetLine1: registerInput.street,
            countryCode: "ET",
            company: registerInput.company,
            city: registerInput.city,
            province: registerInput.state,
            customFields: {
                fax: registerInput.fax,
            }
        }
        if (isGraphQlErrorResult(result)) {
            console.log(result);
            return { success: false }
        }
        await this.customerService.createAddress(ctx, result.id, customerAddressInput);
        console.log('not here')
        return { success: true }
     }
}
