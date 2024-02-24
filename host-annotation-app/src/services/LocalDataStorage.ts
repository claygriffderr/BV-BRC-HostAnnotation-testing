
import { GetResult, Preferences } from "@capacitor/preferences";


export class _LocalDataStorage {

   // Get a JSON object persisted using the Preferences API.
   public async get<T>(key_: string): Promise<T> {

      const getResult: GetResult = await Preferences.get({ key: key_ });
      if (!getResult || !getResult.value) { return null; }

      return JSON.parse(getResult.value) as T;
   }

   // Remove a JSON object persisted using the Preferences API.
   public async remove(key_: string): Promise<void> {
      return await Preferences.remove({
         key: key_
      });
   }

   // Add/replace a JSON object persisted using the Preferences API.
   public async set(key_: string, value_: any): Promise<void> {

      if (value_ === null || typeof (value_) === "undefined") { value_ = null; }

      const json = JSON.stringify(value_);

      return await Preferences.set({
         key: key_,
         value: json
      });
   }

}

// Create a singleton instance of _LocalDataStorage.
export const LocalDataStorage = new _LocalDataStorage();
