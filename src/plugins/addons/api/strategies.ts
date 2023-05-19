import { Injector, Order, OrderCodeStrategy, OrderPlacedStrategy, OrderState, PasswordValidationStrategy, RequestContext } from "@etech/core";

export class EthiolabOrderCodeStrategy implements OrderCodeStrategy {
  
    init(injector: Injector) {
    }
  
    async generate(ctx: RequestContext) {
      let random= Math.random();
      let parsed= `${Math.floor(random*10000000)}`;
      return parsed.padStart(7, '0');
    }
}

export class EthiolabPasswordValidationStrategy implements PasswordValidationStrategy {
    validate(ctx: RequestContext, password: string): boolean | string {
      //Regex taken from https://www.coleparmer.com/create-account?ReturnUrl=%2F
      //return RegExp("/(?=^.{7,12}$)(?=.*\d)(?=.*[a-zA-Z])(?=.*[0-9])(?!.*\s)[0-9a-zA-Z!@#$%^&*()]*$").test(password);
      return true;
    }
}