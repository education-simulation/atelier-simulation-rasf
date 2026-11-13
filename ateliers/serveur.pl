#!/usr/bin/perl
# ============================================================
#  MINI-SERVEUR de l'atelier (Mac, Linux, Chromebook) — rien à installer : Perl est fourni avec le système.
#  Sert les fichiers de SON dossier sur http://localhost:<port>/ (pour les ouvrir dans le navigateur d'Antigravity,
#  qui n'ouvre pas les adresses file://). Seulement pour cet ordinateur (127.0.0.1), jamais pour le réseau.
#  Lancement : perl serveur.pl   (port 5500, ou le suivant libre) — affiche « URL=http://localhost:PORT/progression.html ».
#  Ne pas modifier.
# ============================================================
use strict;
use warnings;
use IO::Socket::INET;
use File::Basename qw(dirname);
use Cwd qw(abs_path);

my $dossier = dirname(abs_path($0));
my $port = $ARGV[0] || 5500;
my $serveur;
for my $essai (0 .. 49) {
  $serveur = IO::Socket::INET->new(LocalAddr => '127.0.0.1', LocalPort => $port + $essai, Proto => 'tcp', Listen => 10, ReuseAddr => 0);
  if ($serveur) { $port += $essai; last; }
}
die "Aucun port libre entre $port et " . ($port + 49) . "\n" unless $serveur;
$| = 1;
print "URL=http://localhost:$port/progression.html\n";

my %TYPES = (html => 'text/html; charset=utf-8', js => 'text/javascript; charset=utf-8', css => 'text/css; charset=utf-8',
  json => 'application/json; charset=utf-8', csv => 'text/csv; charset=utf-8', txt => 'text/plain; charset=utf-8',
  svg => 'image/svg+xml', png => 'image/png', jpg => 'image/jpeg', jpeg => 'image/jpeg', gif => 'image/gif', ico => 'image/x-icon');

while (my $client = $serveur->accept) {
  my $ligne = <$client> // '';
  while (my $entete = <$client>) { last if $entete =~ /^\r?\n$/; }
  my ($methode, $chemin) = $ligne =~ m{^(GET|HEAD) (\S+)};
  my ($code, $type, $corps) = (404, 'text/plain; charset=utf-8', "Introuvable\n");
  if ($chemin) {
    $chemin =~ s/[?#].*//;
    $chemin =~ s/%([0-9A-Fa-f]{2})/chr(hex($1))/ge;
    $chemin = '/progression.html' if $chemin eq '/';
    if ($chemin !~ m{\.\.} && -f "$dossier$chemin" && open(my $f, '<:raw', "$dossier$chemin")) {
      local $/; $corps = <$f>; close $f;
      my ($ext) = $chemin =~ /\.(\w+)$/;
      ($code, $type) = (200, $TYPES{lc($ext // '')} // 'application/octet-stream');
    }
  }
  my $statut = $code == 200 ? '200 OK' : '404 Not Found';
  print $client "HTTP/1.1 $statut\r\nContent-Type: $type\r\nContent-Length: " . length($corps) . "\r\nCache-Control: no-store\r\nConnection: close\r\n\r\n";
  print $client $corps if ($methode // '') ne 'HEAD';
  close $client;
}
