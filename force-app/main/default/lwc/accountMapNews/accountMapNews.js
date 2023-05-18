import { LightningElement, track, api } from 'lwc';
import GetAccountAddress from '@salesforce/apex/AccountAddressNews.GetAccountAddress';
import GetAccountNews from '@salesforce/apex/AccountAddressNews.GetAccountNews';
export default class AccountMapNews extends LightningElement {
    @api recordId;
    @track ShowMap=false;
    @track MapMarkers=[];
    @track selectedMarkerValue;
    @track articles=[];
    @track msg;
    @track ShowNews = true;
    @track ShowNewsBtn = true;
    mapOptions = {
        mapTypeId: 'satellite'
      };

    connectedCallback(){
        this.GetLocation();
    }

    async GetLocation(){
        await GetAccountAddress({AccId:this.recordId})
        .then(result => {
            this.MapMarkers.push({location:{City: result[0].BillingCity,Country: result[0].BillingCountry,PostalCode: result[0].BillingPostalCode,State: result[0].BillingState,Street: result[0].BillingStreet},value: result[0].Id, icon: 'standard:account',title: result[0].Name,description: `${result[0].BillingStreet} , ${result[0].BillingCity} , ${result[0].BillingState} , ${result[0].BillingCountry} , ${result[0].BillingPostalCode}`});
            this.selectedMarkerValue = result[0].Id;
            this.ShowMap=true;
        })
        .catch(error => {
            console.log(error);
        })
    }

    handleMarkerSelect(event) {
        this.selectedMarkerValue = event.target.selectedMarkerValue;
    }

    async GetNewsByQuery(){
        if(this.MapMarkers && this.articles.length==0){
            this.msg='Please wait...';
            //console.log(this.MapMarkers.length);
            await GetAccountNews({q:this.MapMarkers[0].title,c:''})
            .then(async result => {
                //console.log(result);
                if(result.length>0){
                    result.forEach((i,j) => ({
                       ...i,Id:j+1
                    }));
                    this.articles = result;
                    this.msg='';
                    this.ShowNewsBtn = false;
                }
                else{
                    await this.GetNewsByCategory();
                    this.msg = `Not found any news related to ${this.MapMarkers[0].title}. Still you can read some bussiness articles below.`;
                }
            })
            .catch(error => {
                console.log(error);
            });
        }
        this.ShowNews=true;
        this.ShowNewsBtn=false;
    }

    async GetNewsByCategory(){
        //console.log('category');
        await GetAccountNews({q:'',c:'business'})
        .then(result => {
            //console.log(result.length);
            result.forEach((i,j) => ({
                ...i,Id:j+1
            }));
            this.articles = result;
            this.ShowNewsBtn = false;
        })
        .catch(error => {
            console.log(error);
        });
    }

    HideNewsBtn(){
        this.ShowNews=false;
        this.ShowNewsBtn=true;
    }

}