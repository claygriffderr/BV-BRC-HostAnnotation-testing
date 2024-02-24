
using System;
using System.Diagnostics;
using System.Runtime.CompilerServices;

namespace HostAnnotation.Utilities {
    
    // An exception that uses introspection to dynamically determine the name of the calling object and method.
    public class SmartException : Exception {

        // The name of the object and method where the exception occurred.
        protected string? _methodName = null;
        protected string? _objectName = null;


        // C-tor
        public SmartException(string? message_, string? methodName_, string? objectName_)
            : base(message_) {

            _methodName = methodName_;
            _objectName = objectName_;
        }


        #region Properties

        public string methodName {
            get {
                if (string.IsNullOrEmpty(_methodName)) { _methodName = ""; }
                return _methodName;
            }
            set { _methodName = value; }
        }
        public string methodAndObjectNames {
            get {
                string methodAndObject = "";
                methodAndObject += objectName;

                if (methodName.Length > 0) {
                    if (objectName.Length > 0) { methodAndObject += "."; }
                    methodAndObject += methodName;
                }
                return methodAndObject;
            }
            set { }
        }
        public string objectName {
            get {
                if (string.IsNullOrEmpty(_objectName)) { _objectName = ""; }
                return _objectName;
            }
            set { _objectName = value; }
        }

        #endregion


        // This attribute ensures that the compiler will not in-line the method, and the stack trace will contain the true calling method.
        [MethodImpl(MethodImplOptions.NoInlining)]
        public static SmartException create(string? message_) {

            string? methodName = null;
            string? objectName = null;

            // Get frame 1 of the call stack
            StackTrace stackTrace = new();
            StackFrame? stackFrame = stackTrace.GetFrame(1);

            // Get the name of the calling method and the type of the caller.
            if (stackFrame != null) {
                methodName = stackFrame.GetMethod()?.Name;
                objectName = stackFrame.GetMethod()?.DeclaringType?.FullName;
            }

            return new SmartException(message_, methodName, objectName);
        }

    }
}
