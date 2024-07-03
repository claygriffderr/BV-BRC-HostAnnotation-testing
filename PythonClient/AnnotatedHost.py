
from marshmallow import Schema, fields, post_load


# An annotated host object that's returned by AnnotatedHost.annotateHost().
class AnnotatedHost:

   def __init__(self, algorithmID, classCommonName, classScientificName, commonName, hostID, 
                hostText, id, isAvian, rankName, scientificName, score, status, statusDetails, 
                synonyms, taxonNameMatchID, taxonomyDB, taxonomyID):
      self.algorithmID = algorithmID
      self.classCommonName = classCommonName
      self.classScientificName = classScientificName
      self.commonName = commonName
      self.hostID = hostID
      self.hostText = hostText
      self.id = id
      self.isAvian = isAvian
      self.rankName = rankName
      self.scientificName = scientificName
      self.score = score
      self.status = status
      self.statusDetails = statusDetails
      self.synonyms = synonyms
      self.taxonNameMatchID = taxonNameMatchID
      self.taxonomyDB = taxonomyDB
      self.taxonomyID = taxonomyID



# The schema definition for the AnnotatedHost object. This is used when deserializing JSON returned by a web service.
class AnnotatedHostSchema(Schema):
   algorithmID = fields.Int()
   classCommonName = fields.Str(allow_none=True)
   classScientificName = fields.Str(allow_none=True)
   commonName = fields.Str(allow_none=True)
   hostID = fields.Int(allow_none=False)
   hostText = fields.Str(allow_none=False)
   id = fields.Int()
   isAvian = fields.Bool()
   rankName = fields.Str()
   scientificName = fields.Str(allow_none=False)
   score = fields.Float()
   status = fields.Str()
   statusDetails = fields.Str(allow_none=True)
   synonyms = fields.Str(allow_none=True)
   taxonNameMatchID = fields.Int()
   taxonomyDB = fields.Str()
   taxonomyID = fields.Int()

   @post_load
   def makeAnnotatedHost(self, data, **kwargs):
        return AnnotatedHost(**data)


