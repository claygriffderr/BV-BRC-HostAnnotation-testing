
namespace HostAnnotation.Utilities {

    // An object whose properties can be accessed via an indexer using the property name.
    public interface IIndexedProperties {

        object? this[string propertyName_] { get; set; }
    }
}