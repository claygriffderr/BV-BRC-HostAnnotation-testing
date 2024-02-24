
export interface ISearchCallback {
   (searchText: string)
}

export class SearchPanelState {

   //pageKey: PageKey;

   searchText: string;

   storageKey: string;

   // TODO: pagination details? sort by column? rows per page?


   // C-tor
   constructor(storageKey_: string) {
      this.storageKey = storageKey_;
   }
}