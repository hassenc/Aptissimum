output = open('output','w')

idx = 0
idx2 = 0
idx3 = 0
offset = 0
c1=0
c2=0
with open('models/animals/bison.js') as f:
    lines = f.readlines()
    for idx, line in enumerate(lines):
    	if idx == 18:
    	  vertices = line[line.find("[")+1:line.find("]")]
    	if idx == 48:
    	  faces = line[line.find("[")+1:line.find("]")]
    
    svertices = vertices.split(',')
    for idx2, vertice in enumerate(svertices):
        if (idx2 % 3 == 0):
            output.write('\n')
            output.write('v '+vertice+' ')
            c1=c1+1
        else:
            output.write(vertice+' ')
    mfaces =faces.split(',')
    for idx3,mface in enumerate(mfaces):
        if (idx3 % 9 == 1):
            print(idx3 % 9,mface)
            output.write('\n')
            output.write('f '+str(int(float(mface)+1))+' ')
            c2=c2+1
        if (idx3 % 9 == 2):
            output.write(str(int(float(mface)+1))+' ')
        if (idx3 % 9 == 3):
            output.write(str(int(float(mface)+1))+' ')
    print(c1)
    print(c2)