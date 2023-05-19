import { EtechPlugin } from "@etech/core";
import { FacebookAuthenticationStrategy, FacebookAuthConfig } from "./FacebookAuthentication";
import { GoogleAuthenticationStrategy } from "./GoogleAuthentication";


@EtechPlugin({
    configuration: config => {
        config.authOptions.shopAuthenticationStrategy.push(new GoogleAuthenticationStrategy('1026633699260-dsqo7t7ucf6km4ktb1340fs2l7ao97rb.apps.googleusercontent.com'))
        config.authOptions.shopAuthenticationStrategy.push(new FacebookAuthenticationStrategy({
            appId: '980997845873215',appSecret: '9bab1bb398d27f2a67ff1708ba83801f', clientToken: '9556348e582ee1917afe3b5f9d002ec8'
        }));
        return config
    }
})
export class SocialLoginPlugin{}