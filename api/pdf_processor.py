import pdfplumber
import pandas as pd
import re
from pathlib import Path

# Configuration par défaut
DEFAULT_JOURNAL = ""
DEFAULT_COMPTE_GENERAL = ""

def extract_raw_data(pdf_path_or_buffer):
    """
    Extrait les données brutes des tableaux du PDF.
    Retourne une liste de dictionnaires.
    Accepts path or file-like object.
    """
    raw_transactions = []
    
    try:
        # pdfplumber.open supports file-like objects
        with pdfplumber.open(pdf_path_or_buffer) as pdf:
            for page in pdf.pages:
                # Stratégie textuelle pour détecter les colonnes sans lignes visibles
                settings = {
                    "vertical_strategy": "text", 
                    "horizontal_strategy": "text", 
                    "snap_tolerance": 3
                }
                tables = page.extract_table(settings)
                
                if not tables:
                    continue
                
                current_trans = None
                header_found = False
                
                for row in tables:
                    # Nettoyage initial : string et suppression retours ligne
                    clean_row = [str(c).strip().replace('\n', ' ') if c else '' for c in row]
                    
                    # Détection de l'en-tête (pour ignorer ce qui précède)
                    if not header_found:
                        if len(clean_row) > 1 and "Date" in clean_row[0] and "S.No." in clean_row[1]:
                            header_found = True
                        continue
                    
                    col0 = clean_row[0]
                    
                    # Détection d'une nouvelle transaction par la date (format JJ/MM/AAAA)
                    if re.match(r'[0-9]{2}/[0-9]{2}/[0-9]{4}', col0):
                        # Ignorer les lignes de bas de page (contiennent souvent "Page X")
                        if "Page" in str(row) or "Page" in clean_row[-1]:
                            continue
                        
                        if current_trans:
                            raw_transactions.append(current_trans)
                        
                        amount_raw = clean_row[-1]
                        if not amount_raw and len(clean_row) > 2:
                            for c in reversed(clean_row):
                                if c.endswith('-') or c.endswith('+'):
                                    amount_raw = c
                                    break
                        
                        current_trans = {
                            'raw_date': col0,
                            'raw_ref': clean_row[1] if len(clean_row) > 1 else "",
                            'raw_amount': amount_raw,
                            'desc_parts': [clean_row[2]] if len(clean_row) > 2 else []
                        }
                    
                    elif current_trans:
                        text = ' '.join([c for c in clean_row if c])
                        if text:
                            current_trans['desc_parts'].append(text)
                
                if current_trans:
                    raw_transactions.append(current_trans)
                    
    except Exception as e:
        print(f"Erreur lors de la lecture du PDF: {e}")
        return []

    return raw_transactions

def transform_transaction(transaction, journal=None, general=None):
    date_clean = transaction['raw_date'].replace('/', '')

    val = str(transaction['raw_amount']).replace(' EUR', '').replace(' ', '').replace('\xa0', '')

    sens = 'C'

    if val.endswith('-'):
        sens = 'D'
        val = val[:-1]
    elif val.endswith('+'):
        sens = 'C'
        val = val[:-1]

    val = val.replace('.', ',')
    if not val:
        val = "0,00"

    full_desc = ' '.join(transaction['desc_parts'])
    full_desc = re.sub(r'\s+', ' ', full_desc).strip()

    return {
        'DATE': date_clean,
        'JOURNAL': journal or DEFAULT_JOURNAL,
        'GENERAL': general or DEFAULT_COMPTE_GENERAL,
        'AUXILIAIRE': '',
        'SENS': sens,
        'MONTANT': val,
        'LIBELLE': full_desc[:35],
        'REFERENCE': str(transaction['raw_ref'])[:35]
    }

def process_bank_statement_buffer(file_buffer, journal=None, general=None):
    """
    Process a file buffer (from upload) directly.
    """
    raw_data = extract_raw_data(file_buffer)
    if not raw_data:
        return pd.DataFrame()

    processed_rows = [transform_transaction(t, journal=journal, general=general) for t in raw_data]
    df = pd.DataFrame(processed_rows)
    return df
