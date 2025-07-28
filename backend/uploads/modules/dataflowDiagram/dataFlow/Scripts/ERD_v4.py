import csv
from collections import defaultdict
from graphviz import Digraph

def load_schema_from_csv(csv_path):
    tables = defaultdict(dict)
    with open(r"C:\Users\Admin\Desktop\Camerin\backend\uploads\modules\dataflowDiagram\dataFlow\Inputs\Entity_relations1.csv", newline='', encoding='utf-8') as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            table = row['Table'].strip()
            column = row['Column'].strip()
            coltype = row['Type'].strip()
            tables[table][column] = coltype
    return tables

def generate_er_diagram(tables, output_filename=r"C:\Users\Admin\Desktop\Camerin\backend\uploads\modules\dataflowDiagram\dataFlow\Outputs\er_diagram"):
    er = Digraph('ER_Diagram', format='png')
    er.attr(rankdir='LR', size='8,5')

    # Draw nodes (tables) with HTML-style labels
    for table, columns in tables.items():
        label = '<TABLE BORDER="1" CELLBORDER="1" CELLSPACING="0">'
        label += f'<TR><TD COLSPAN="2"><B>{table}</B></TD></TR>'
        for col, coltype in columns.items():
            col_html = col.replace('<', '&lt;').replace('>', '&gt;')
            coltype_html = coltype.replace('<', '&lt;').replace('>', '&gt;')
            label += f'<TR><TD>{col_html}</TD><TD>{coltype_html}</TD></TR>'
        label += '</TABLE>'
        er.node(table, label=f'<{label}>', shape='plaintext')

    # Draw foreign key edges
    for table, columns in tables.items():
        for col, coltype in columns.items():
            if "FK ->" in coltype:
                targets_str = coltype.split("->")[1].strip()
                targets = [t.strip() for t in targets_str.split('|')]  # support multiple targets
                for target in targets:
                    if '.' in target:
                        target_table = target.split(".")[0].strip()
                        er.edge(table, target_table, label=col)

    er.render(output_filename, view=True)

# Run
if __name__ == "__main__":
    schema = load_schema_from_csv('schema.csv')
    generate_er_diagram(schema)