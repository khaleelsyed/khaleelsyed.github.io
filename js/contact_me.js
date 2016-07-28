// Prevent spam click and default submit behaviour
            $("#btnSubmit").attr("disabled", true);
            event.preventDefault();
-
+
            // get values from FORM
            var name = $("input#name").val();
            var email = $("input#email").val();
@@ -20,41 +20,6 @@ $(function() {
            if (firstName.indexOf(' ') >= 0) {
                firstName = name.split(' ').slice(0, -1).join(' ');
            }
        },
        filter: function() {
            return $(this).is(":visible");
