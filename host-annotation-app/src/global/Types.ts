

//------------------------------------------------------------------------------------------------------
// Enums, most of which represent server-side terms
//------------------------------------------------------------------------------------------------------

export enum AppRole {
   administrator = "administrator",
   api_user = "api_user",
   curator = "curator",
   unknown = "unknown",
   viewer = "viewer"
}

export enum ButtonSize {
   block = "block",
   small = "small",
   medium = "medium"
}

export enum ControlType {
   password = "password",
   readOnly = "readOnly",
   select = "select",
   termList = "termList",
   text = "text",
   textArea = "textArea"
}

export enum CurationType {
   alternate_spelling = "alternate_spelling",
   filtered_characters = "filtered_characters",
   ignore = "ignore",
   stop_word = "stop_word",
   subspecies_qualifier = "subspecies_qualifier",
   synonym = "synonym"
}

// The names of all non-ionic icons.
export enum CustomIcon {
   history = "history",
   spinner = "spinner"
}

export enum GenericStatus {
   error = "error",
   info = "info",
   primary = "primary", // Technically, this isn't a status, but it's convenient to include.
   success = "success",
   unspecified = "unspecified",
   warning = "warning"
}

export enum HeaderControlType {
   back = "back",
   menu = "menu",
   none = "none"
}

// HTTP headers used with web services.
export enum HeaderKey {
   authToken = "authorization"
}

export enum HostTokenType {
   add_s_to_end = "add_s_to_end",
   alt_spelling_or_synonym = "alt_spelling_or_synonym",
   append_spdot = "append_spdot",
   //curation_ignored,
   minus_one_word = "minus_one_word",
   minus_one_word_left = "minus_one_word_left",
   minus_three_words = "minus_three_words",
   minus_three_words_left = "minus_three_words_left",
   minus_two_words = "minus_two_words",
   minus_two_words_left = "minus_two_words_left",
   //original,
   prepend_common = "prepend_common",
   remove_common_append_spdot = "remove_common_append_spdot",
   remove_common_from_start = "remove_common_from_start",
   remove_s_append_spdot = "remove_s_append_spdot",
   remove_s_from_end = "remove_s_from_end",
   remove_spdot_from_end = "remove_spdot_from_end",
   stop_words_removed = "stop_words_removed",
   unmodified = "unmodified"
}

export function HostTokenTypeLookup(tokenType_: HostTokenType): string {

   if (!tokenType_) { return null; }

   switch (tokenType_) {
      case HostTokenType.add_s_to_end:
         return "Add S to end";
      case HostTokenType.alt_spelling_or_synonym:
         return "Alt spelling/synonym";
      case HostTokenType.append_spdot:
         return "Append sp."
      case HostTokenType.minus_one_word:
         return "Minus 1 word";
      case HostTokenType.minus_one_word_left:
         return "Minus 1 word (left)";
      case HostTokenType.minus_three_words:
         return "Minus 3 words";
      case HostTokenType.minus_three_words_left:
         return "Minus 3 words (left)";
      case HostTokenType.minus_two_words:
         return "Minus 2 words";
      case HostTokenType.minus_two_words_left:
         return "Minus 2 words (left)";
      case HostTokenType.prepend_common:
         return "Prepend common";
      case HostTokenType.remove_common_append_spdot:
         return "Remove common, append sp.";
      case HostTokenType.remove_common_from_start:
         return "Remove common from start";
      case HostTokenType.remove_s_append_spdot:
         return "Remove s, append sp."
      case HostTokenType.remove_s_from_end:
         return "Remove s from end";
      case HostTokenType.remove_spdot_from_end:
         return "Remove sp. from end";
      case HostTokenType.stop_words_removed:
         return "Stop words removed";
      case HostTokenType.unmodified:
         return "Unmodified";
      default: return "???";
   }
}

export enum LabelOrientation {
   left = "left",
   none = "none",
   top = "top"
}

export enum NcbiNameClass {
   acronym = "acronym",
   blast_name = "blast_name",
   common_name = "common_name",
   equivalent_name = "equivalent_name",
   genbank_acronym = "genbank_acronym",
   genbank_common_name = "genbank_common_name",
   scientific_name = "scientific_name",
   synonym = "synonym"
}

export function NcbiNameClassLookup(nameClass_: NcbiNameClass): string {
   
   if (!nameClass_) { return null; }

   switch (nameClass_) {
      case NcbiNameClass.acronym:
         return "Acronym";
      case NcbiNameClass.blast_name:
         return "BLAST name";
      case NcbiNameClass.common_name:
         return "Common name";
      case NcbiNameClass.equivalent_name:
         return "Equivalent name";
      case NcbiNameClass.genbank_acronym:
         return "GenBank acronym";
      case NcbiNameClass.genbank_common_name:
         return "GenBank common name";
      case NcbiNameClass.scientific_name:
         return "Scientific name";
      case NcbiNameClass.synonym:
         return "Synonym";
      default: 
         return null;
   }
}

// All pages in the application.
export enum PageKey {
   annotateHost = "annotateHost",
   createCuratedWord = "createCuratedWord",
   curatedWords = "curation/curatedWords",
   editCuratedWord = "editCuratedWord",
   home = "curation/home",
   hosts = "curation/hosts",
   login = "login",
   privacyPolicy = "privacyPolicy",
   resetPassword = "resetPassword",
   taxonomySearch = "curation/taxonomySearch",
   termsOfService = "termsOfService",
   test = "test",
   userProfile = "userProfile",
   viewHost = "viewHost"
}

// Common/standard web service parameter names.
export enum ParameterName {
   email = "email",
   password = "password"
}

// Keys used to get and set data values in local storage.
export enum StorageKey {
   authState = "bvbrc_auth_state",
   person = "bvbrc_person"
}

export enum TaxonMatchType {
   custom_text = "custom_text",
   direct_match = "direct_match",
   direct_match_cross_reference = "direct_match_cross_reference",
   indirect_match = "indirect_match",
   indirect_match_cross_reference = "indirect_match_cross_reference",
   manual_selection = "manual_selection"
}

export function TaxonMatchTypeLookup(matchType_: TaxonMatchType): string {

   if (!matchType_) { return ""; }

   switch (matchType_) {
      case TaxonMatchType.custom_text:
         return "custom text";
      case TaxonMatchType.direct_match:
         return "direct match";
      case TaxonMatchType.direct_match_cross_reference:
         return "direct match (xref)";
      case TaxonMatchType.indirect_match:
         return "indirect match";
      case TaxonMatchType.indirect_match_cross_reference:
         return "indirect match (xref)";
      case TaxonMatchType.manual_selection:
         return "manual selection";
      default: return "";
   }
}

export enum TaxonomyDB {
   bv_brc = "bv_brc",
   ebird = "ebird",
   itis = "itis",
   ncbi = "ncbi"
}

export function TaxonomyDbLookup(taxDB_: TaxonomyDB): string {
   
   if (!taxDB_) { return null; }

   switch (taxDB_) {
      case TaxonomyDB.bv_brc:
         return "BV-BRC";
      case TaxonomyDB.ebird:
         return "ebird";
      case TaxonomyDB.itis:
         return "ITIS";
      case TaxonomyDB.ncbi:
         return "NCBI";
      default: 
         return null;
   }
}

export enum UserStatus {
   active = "active",
   deleted = "deleted",
   pending = "pending",
   removed = "removed"
}

// Keys representing all available web services.
export enum WebServiceKey {

   // Account
   resetPassword =  "resetPassword",
   
   // Administrator services
   // TODO

   // Annotation
   annotateHostText = "annotateHostText",
   getAnnotatedHost = "getAnnotatedHost",
   getHostTaxaMatches = "getHostTaxaMatches",
   searchAnnotatedHosts = "searchAnnotatedHosts",
   
   // Curated word
   createCuratedWord = "createCuratedWord",
   getCuratedWord = "getCuratedWord",
   searchCuratedWords = "searchCuratedWords",
   updateCuratedWord = "updateCuratedWord",

   // Other
   test = "test",

   // Taxonomy
   getTaxonName = "getTaxonName",
   searchTaxonomyDBs = "searchTaxonomyDBs",

   // Unauthenticated services
   login = "login"
}



//------------------------------------------------------------------------------------------------------
// Interfaces
//------------------------------------------------------------------------------------------------------

export interface IAuthState {

   // The user's application role.
   appRole: AppRole;

   // The authentication/authorization token used by web services.
   authToken: string;

   // Has the user been authenticated?
   isAuthenticated: boolean;
}

// Used by the Router to update the AuthState on app-root.
export interface IAuthStateCallback {
   (authState_: IAuthState)
}

// A function that returns a boolean value.
export interface IBoolFunction {
   (): Promise<boolean>
}

// A callback function registered with the Router by a page.
export interface IRouteChangeHandler {
   ()
}

export interface ISideMenu {
   isOpen: boolean;
}

export interface ISelectionHandler {
   (value_: string): Promise<boolean>
}

export interface IUIEventHandler {
   (event_: UIEvent)
}