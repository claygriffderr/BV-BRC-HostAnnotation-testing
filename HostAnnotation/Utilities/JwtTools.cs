
using System.Text;
using Jose;
using Newtonsoft.Json;


namespace HostAnnotation.Utilities {

    //----------------------------------------------------------------------------------------------------------------
	// https://jwt.io/introduction/
	// https://github.com/dvsekhvalnov/jose-jwt
    //----------------------------------------------------------------------------------------------------------------
	public class JwtTools {

        // Set default algorithms and encryption
        public JweAlgorithm _encryptionAlgorithm = JweAlgorithm.PBES2_HS256_A128KW;
        public JweEncryption _encryption = JweEncryption.A128CBC_HS256;
        public JwsAlgorithm _signingAlgorithm = JwsAlgorithm.HS256;


        // C-tor
        public JwtTools() { }


        // C-tor to override default algorithms
        public JwtTools(JweAlgorithm encryptionAlgorithm_, JweEncryption encryption_) {
            _encryptionAlgorithm = encryptionAlgorithm_;
            _encryption = encryption_;
        }


        #region Decode

        // Use Jose JWT to decode the token and extract the payload, then use the NewtonSoft library to deserialize it.
        public T? decode<T>(object secretKey_, string? token_) {

            T? t = default;

            var payload = JWT.Decode(token_, secretKey_);
            if (payload == null) { return t; }

            t = JsonConvert.DeserializeObject<T>(payload);

            return t;
        }


        // Using the secret key, decode the encrypted JWT token.
        public T decodeEncrypted<T>(object secretKey_, string? token_) {

            if (secretKey_ == null) { throw SmartException.create("Invalid secret key"); }
			if (string.IsNullOrEmpty(token_) || token_ == "null") { throw SmartException.create("Invalid token"); }

            T? t;

            try {
                t = JWT.Decode<T>(token_, secretKey_, _encryptionAlgorithm, _encryption);
            }
            catch (Exception exc_) {
                throw SmartException.create(exc_.Message);
            }

            return t;
        }

        // Using the secret key, decode the unencrypted JWT token.
        public T decodeUnencrypted<T>(object secretKey_, string token_) {

            object? secretKey = secretKey_;
            if (secretKey == null) { throw SmartException.create("Invalid secret key"); }
			if (string.IsNullOrEmpty(token_)) { throw SmartException.create("Invalid token"); }
            
            if (_signingAlgorithm == JwsAlgorithm.HS256 ||
                _signingAlgorithm == JwsAlgorithm.HS384 ||
                _signingAlgorithm == JwsAlgorithm.HS512) {

                if (secretKey.GetType().Equals(typeof(string))) {
                    secretKey = Encoding.UTF8.GetBytes((string)secretKey);
                }
            }

            T? t = default;

            try {
                t = JWT.Decode<T>(token_, secretKey, _signingAlgorithm);
            }
            catch (Exception exc_) {
                throw SmartException.create(exc_.Message);
            }

            return t;
        }

        #endregion

        #region Encode

        // Using the secret key, encode the payload object as an encrypted JWT.
        public string encodeEncryptedAndSigned(object payload_, object secretKey_) {

            // Serialize the object as JSON (escaping Unicode characters for UTF-8)
            string json = JsonConvert.SerializeObject(payload_, new JsonSerializerSettings() {
                DateFormatString = "yyyy-MM-ddThh:mm:ssZ",
                StringEscapeHandling = StringEscapeHandling.EscapeNonAscii
            });
            
            return JWT.Encode(json, secretKey_, _encryptionAlgorithm, _encryption, JweCompression.DEF);
        }

        // Using the secret key, encode the payload object as a signed but unencrypted JWT.
        public string encodeUnencryptedAndSigned(object payload_, object secretKey_) {

            object? secretKey = secretKey_;

            if (_signingAlgorithm == JwsAlgorithm.HS256 ||
                _signingAlgorithm == JwsAlgorithm.HS384 ||
                _signingAlgorithm == JwsAlgorithm.HS512) {

                if (secretKey.GetType().Equals(typeof(string))) {
                    secretKey = Encoding.UTF8.GetBytes((string)secretKey);
                }
            }

            // Serialize the object as JSON (escaping Unicode characters for UTF-8)
            string? json = JsonConvert.SerializeObject(payload_, new JsonSerializerSettings() {
                DateFormatString = "yyyy-MM-ddThh:mm:ssZ",
                StringEscapeHandling = StringEscapeHandling.EscapeNonAscii
            });

            return JWT.Encode(json, secretKey, _signingAlgorithm);
        }
        
        #endregion

    }
}

