import sys
import re
import json

filename = sys.argv[1]
complexes = []

current_complex = None

with open(filename) as f:
	for line in f:
		if line.startswith("Complex"):
			current_complex = {}
			r = re.compile("Complex getDisplayName\(\) =(.+)getRDFId = (.*)")
			m = r.match(line)
			current_complex["name"] = m.group(1).strip()
			current_complex["RDFId"] = m.group(2).strip()
			current_complex["elements"] = []
			complexes.append(current_complex)
		else:
			current_complex["elements"].append(line.strip())

print( str(len(complexes)) + " complexes found" )

j = json.dumps(complexes)
with open("out.json", "w") as text_file:
    text_file.write(j)
      	 
       	

