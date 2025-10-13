from datetime import datetime, timedelta

FMT = "%d/%m/%Y"

def daterange(start_str, end_str):
    """
    Generador de fechas en formato "DD/MM/AAAA" entre start y end (ambos incluidos).
    """
    start_date = datetime.strptime(start_str, FMT)
    end_date = datetime.strptime(end_str, FMT)
    for n in range(int((end_date - start_date).days) + 1):
        yield (start_date + timedelta(n)).strftime(FMT)