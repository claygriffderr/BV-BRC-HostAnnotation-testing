
# The Host Annotation workflow

1) Pre-process the hostname to improve the likelihood of a name match
	- Remove non-alphanumeric characters (Ex. "-")
	- Replace subspecies qualifiers (Ex. "serotype")
	- Remove age text (Ex. "1 - 10 year old")
	- Replace separators with commas (Ex. parentheses)
	- Convert to lowercase
	- Use a comma delimiter to split into multiple hostnames

2) Include multiple variations on the pre-processed hostname to improve the likelihood of a name match
	- Primary variations: 
      - The pre-processed hostname
	  - A variant with stop words removed
      - A variant that has been updated with alternate spellings or synonyms.

    -  Create modified copies of the (up to) 3 primary variants using text patterns
		- Patterns that add or remove "common", "sp.", and "s".
			- Append sp.
			- Add "s" to end
			- Prepend "common"
			- Remove "common"
			- Remove "s", append "sp."
			- Remove "s" from end
			- Remove "sp." from end
			- Remove "common", append "sp."
		- Patterns the remove words from the left or right
			- Minus (1, 2, or 3) from left
			- Minus (1, 2, or 3) from right

3) Search the taxon name table in 4 passes:
   - **Direct matches**
	- **Implicit matches**: Names from the same taxonomy database as a direct match that share the same unique identifier (taxonomy ID). 
	For example, if the direct match is a scientific name from NCBI Taxonomy, the implicit matches might be common names from 
	NCBI Taxonomy with the same taxID as the direct match.
	- **Cross references**: Direct matches of implicit matches from a different source taxonomy database.
	- **Implicit cross references**: Names from the same taxonomy database as the cross reference match that share the same 
	unique identifier (taxonomy ID).

4) Score the search results. Every taxonomy match is assigned the following scores:
    - **Priority score** (0 or 1): A higher score is given to 1) Avian hostnames with a match in eBird and 2) non-Avian matches that are in both ITIS and NCBI Taxonomy.
	- **Hostname type score** (1 - 8): A measure of the number and type of text modifications applied to the hostname (Ex. An unmodified hostname is more reliable than one with 2 words removed).
	- **Cross reference score** (1 - 5): A specificity (name class) score for the source of a cross reference.
	- **Name class score** (1 - 4): The specificity of the hostname"s name class (Ex. Scientific name is more specific than Common name).
	- **Match type score** (1 - 4): A score based on how the hostname was matched with a taxon name (Ex. assignment by a human curator is more reliable than an automated match).
	- **Rank name score** (0 - 35): The specificity of the hostname"s taxonomic rank.

5) Process high-scoring results
    - A composite score is calculated for each taxonomy match. The composite scoring function is: 
		- A measure of the accuracy and reliability of an automated hostname / taxonomy database match ranging from 1 - 100.
		- A linear combination of annotation score values, where the scale factor of each value is determined by a custom algorithm.
		- The decimal value of a novel number system where the "digits" are the annotation scores and their position is determined by the relative importance of the score type.
    - The Scientific name with the highest composite score is selected.
	- The Scientific name is used to determine the preferred common name, the taxonomic rank, class names, and common name synonyms.
	- Scientific-name-match scores below a threshold value are flagged for manual curation.

6) Generate final annotations: This includes the Scientific name, Common name, Taxonomic rank, the Scientific name and 
Common name of the taxonomic class, and common name synonyms.



[Back](./README.md)





