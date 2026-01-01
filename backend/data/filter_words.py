"""
Filter out non-standard words from the dictionary.
Removes: repeated letters (aaa, zzz), interjections (aargh), 
single letters, abbreviations, etc.
"""

def is_valid_word(word):
    """Check if a word looks like a real English word."""
    
    # Remove words longer than 7 characters
    if len(word) > 7:
        return False
    
    # Remove single and two-letter words (except common ones)
    common_short = {'a', 'i', 'am', 'an', 'as', 'at', 'be', 'by', 'do', 'go', 
                    'he', 'hi', 'if', 'in', 'is', 'it', 'me', 'my', 'no', 'of',
                    'on', 'or', 'ox', 'so', 'to', 'up', 'us', 'we'}
    if len(word) <= 2 and word not in common_short:
        return False
    
    # Remove words with 3+ repeated letters (aaa, zzz, etc.)
    for i in range(len(word) - 2):
        if word[i] == word[i+1] == word[i+2]:
            return False
    
    # Remove common interjections/exclamations
    interjections = {
        'aargh', 'aarrgh', 'aarrghh', 'aaargh', 'aah', 'aahed', 'aahing', 'aahs',
        'argh', 'aaronic', 'aaronical', 'aaronite', 'aaronitic',
        'mm', 'mmm', 'hmm', 'hmmm', 'uhh', 'umm', 'err', 'grr',
        'brr', 'brrr', 'psst', 'shh', 'tsk', 'ugh', 'whee', 'woo',
        'yay', 'yippee', 'yuck', 'yum', 'zzz'
    }
    if word in interjections:
        return False
    
    # Remove words that are just repeated 2-letter patterns (bobo, lala, etc.)
    if len(word) == 4 and word[:2] == word[2:]:
        # Except legitimate words
        legitimate_doubles = {'bobo', 'coco', 'dodo', 'mama', 'papa', 'tutu'}
        if word not in legitimate_doubles:
            return False
    
    # Keep everything else
    return True


def filter_wordlist(input_file, output_file):
    """Filter the word list and save cleaned version."""
    
    print(f"Reading from {input_file}...")
    with open(input_file, 'r', encoding='utf-8') as f:
        all_words = [line.strip().lower() for line in f if line.strip()]
    
    print(f"Original word count: {len(all_words)}")
    
    # Filter words
    valid_words = [word for word in all_words if is_valid_word(word)]
    
    print(f"Filtered word count: {len(valid_words)}")
    print(f"Removed: {len(all_words) - len(valid_words)} words")
    
    # Save filtered list
    with open(output_file, 'w', encoding='utf-8') as f:
        for word in valid_words:
            f.write(word + '\n')
    
    print(f"Saved to {output_file}")
    
    # Show some examples of removed words
    removed = set(all_words) - set(valid_words)
    print(f"\nExample removed words: {list(removed)[:20]}")


if __name__ == "__main__":
    input_file = "words.txt"
    output_file = "words_filtered.txt"
    filter_wordlist(input_file, output_file)
