ABOUT:

pos-js is a Javascript port of Mark Watson's FastTag Part of Speech Tagger
which was itself based on Eric Brill's trained rule set and English
lexicon.

pos-js also includes a basic lexer that can be used to extract words and
other tokens from text strings.

pos-js was written by [Percy Wegmann](http://www.percywegmann.com/) and
is [available on Google code](https://code.google.com/p/jspos/). This fork
adds node.js and m support.

LICENSE:

jspos is licensed under the GNU LGPLv3

INSTALL:

`$ m install pos`

USAGE:

```javascript
var pos = require('pos');
var words = new pos.Lexer().lex('This is some sample text. This text can contain multiple sentences.');
var tagger = new pos.Tagger();
var taggedWords = tagger.tag(words);
for (i in taggedWords) {
    var taggedWord = taggedWords[i];
    var word = taggedWord[0];
    var tag = taggedWord[1];
    console.log(word + " /" + tag);
}

// extend the lexicon
tagger.extendLexicon({'Obama': ['N']});
tagger.tag(['Mr', 'Obama']);
// --> [[ 'Mr', 'N' ], [ 'Obama', 'N' ]]
```

ACKNOWLEDGEMENTS:

Thanks to Mark Watson for writing FastTag, which served as the basis for jspos.

TAGS:

    CC Coord Conjuncn           and,but,or
    CD Cardinal number          one,two
    DT Determiner               the,some
    EX Existential there        there
    FW Foreign Word             mon dieu
    IN Preposition              of,in,by
    JJ Adjective                big
    JJR Adj., comparative       bigger
    JJS Adj., superlative       biggest
    LS List item marker         1,One
    MD Modal                    can,should
    NN Noun, sing. or mass      dog
    NNP Proper noun, sing.      Edinburgh
    NNPS Proper noun, plural    Smiths
    NNS Noun, plural            dogs
    POS Possessive ending       �s
    PDT Predeterminer           all, both
    PP$ Possessive pronoun      my,one�s
    PRP Personal pronoun         I,you,she
    RB Adverb                   quickly
    RBR Adverb, comparative     faster
    RBS Adverb, superlative     fastest
    RP Particle                 up,off
    SYM Symbol                  +,%,&
    TO �to�                     to
    UH Interjection             oh, oops
    VB verb, base form          eat
    VBD verb, past tense        ate
    VBG verb, gerund            eating
    VBN verb, past part         eaten
    VBP Verb, present           eat
    VBZ Verb, present           eats
    WDT Wh-determiner           which,that
    WP Wh pronoun               who,what
    WP$ Possessive-Wh           whose
    WRB Wh-adverb               how,where
    , Comma                     ,
    . Sent-final punct          . ! ?
    : Mid-sent punct.           : ; �
    $ Dollar sign               $
    # Pound sign                #
    " quote                     "
    ( Left paren                (
    ) Right paren               )


HS (possessive relative pronoun) 100.00% 99.38% 99.69%
PS (possessive pronoun) 99.38% 99.58% 99.48%
VB (verb) 98.82% 99.17% 98.99%
IE (innitive marker) 98.34% 98.98% 98.66%
PP (preposition) 97.65% 99.12% 98.38%
PN (pronoun) 98.10% 98.24% 98.17%
NN (noun) 97.90% 98.21% 98.06%
DT (determiner) 97.69% 98.33% 98.01%
KN (conjunction) 97.77% 97.52% 97.65%
RG (cardinal number) 97.39% 94.82% 96.08%
SN (subordinating conjunction) 96.79% 94.61% 95.69%
HD (relative determiner) 95.94% 93.76% 94.84%
JJ (adjective) 94.94% 94.04% 94.49%
HP (relative pronoun) 92.67% 96.32% 94.46%
AB (adverb) 94.44% 94.29% 94.36%
PM (proper noun) 93.03% 92.40% 92.71%
RO (ordinal number) 94.51% 90.33% 92.37%
IN (interjection) 93.66% 87.40% 90.42%
HA (relative adverb) 94.76% 86.22% 90.29%
PC (participle) 89.55% 90.97% 90.25%
PL (verb particle) 87.17% 83.11% 85.09%
UO (foreign word) 66.99% 39.91% 50.02%
