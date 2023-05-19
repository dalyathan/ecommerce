import { NgModule } from '@angular/core';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule } from '@angular/forms';
import { SharedModule } from '@etech/admin-ui/package/core';
import { registerFormInputComponent } from '@etech/admin-ui/package/core';
import { ZoneSelectorInputComponent } from './components/zone-selector-component/zone-selector.component';
import { CountrySelectorInputComponent } from './components/country-selector-component/country-selector.component';
import { WeShipWithAirToComponent } from './components/we-ship-with-air-to.component';
import { WeShipComponent } from './components/we-ship-to/we-ship-to.component';
import { WeShipWithLandToComponent } from './components/we-ship-with-land-to.component';
@NgModule({
imports: [NgSelectModule, FormsModule, SharedModule],
  declarations: [ZoneSelectorInputComponent, CountrySelectorInputComponent, WeShipWithLandToComponent,
    WeShipComponent,WeShipWithAirToComponent],
  providers: [
    registerFormInputComponent('zone-selector', ZoneSelectorInputComponent),
    registerFormInputComponent('country-selector', CountrySelectorInputComponent),
    registerFormInputComponent('we-ship-with-air-to', WeShipWithAirToComponent),
    registerFormInputComponent('we-ship-with-land-to', WeShipWithLandToComponent),
  ],
  exports:[WeShipComponent]
})
export class GeoSelectorModule {}