
namespace HostAnnotation.Utilities {

    public interface IUsefulObject : IIndexedProperties {

        // A method that can (optionally) overridden to perform additional processing of
        // the object's contents (for instance, after being populated via indexed properties).
        void process();
    }
}
