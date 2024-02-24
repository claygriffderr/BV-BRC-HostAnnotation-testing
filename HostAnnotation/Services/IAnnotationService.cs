using System;
using System.Collections.Generic;
using HostAnnotation.Common;
using HostAnnotation.Models;

namespace HostAnnotation.Services {

    public interface IAnnotationService {

        AnnotatedHost? annotateHostText(string initialText_);

        AnnotatedHost? getAnnotatedHost(int hostID_);

        List<HostTaxonMatch>? getHostTaxaMatches(int hostID_);

        List<AnnotatedHost>? searchAnnotatedHosts(string searchText_);

    }
}
