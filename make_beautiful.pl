=head1

	The purpose of this script is pretty obvious. There's
	just one issue with it, I've been told that Git gives
	a lot of trouble when large scale changes are made 
	and then merged with another branch.
	
	So as to not lose the code, I'll put this script in, 
	but it shouldn't get used until all the branches of
	this repo get merged.

=cut
#!/user/bin/env perl

use strict;
use warnings;
use JavaScript::Beautifier (qw(js_beautify));

my @javascript_files = <*.js>;

foreach my $file (@javascript_files) {
	print "Making $file look sexy!\n";
	
	# Grab all the data in the file.
	open my $file_handle_input, '<', $file or die("Error: $!\n\n");
	my $text = do { local $/; <$file_handle_input> };
	close $file_handle_input;
	
	# Prepare the text for prettying.
	$text =~ s/\t//g; # Remove all tabs.
	
	# // vim: noet:ts=4:sw=4
	$text =~ s/\/\/ vim: noet:ts=\d+:sw=\d+//g; # Remove the - much hated by me - Vim notices.
	
	my $pretty_js = js_beautify($text, {
        indent_size => 1,
        indent_character => '	',
    });
	
	# For all of the parts where the Web Client generates HTML.
	$pretty_js =~ s/', '    /',\n'    /g;
	
	# Open file, write data and close.
	open my $file_handle_output, '>', $file or die("Error: $!\n\n");
	print {$file_handle_output} $pretty_js;
	close $file_handle_output;
}

print "Done. Checked on ".@javascript_files." JavaScript files.\n\n";