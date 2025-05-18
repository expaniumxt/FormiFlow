// Lista de días festivos en formato 'YYYY-MM-DD'
let holidays = ['2023-01-06', '2023-03-20', '2023-04-06', '2023-04-07', '2023-05-01', '2023-05-02', '2023-05-15','2023-08-15', '2023-10-12','2023-11-01','2023-11-09', '2023-12-06','2023-12-08', '2023-12-25', '2024-01-01', '2024-01-06', '2024-03-28', '2024-03-29', '2024-05-01', '2024-05-02', '2024-07-25', '2024-08-15', '2024-10-12', '2024-11-01', '2024-12-06', '2024-12-25', '2025-01-01', '2025-01-06', '2025-04-17', '2025-04-18', '2025-05-01', '2025-05-02', '2025-07-25', '2025-08-15', '2025-11-01', '2025-12-06', '2025-12-08', '2025-12-25']; 
    
function addBusinessPeriod(startDate, numPeriods, periodType, holidays) {
    if(startDate !== null){
    let currentDate = new Date(startDate);

    if (periodType === 'm') {
        currentDate.setMonth(currentDate.getMonth() + numPeriods);
    } else if (periodType === 'a') {
        currentDate.setFullYear(currentDate.getFullYear() + numPeriods);
    } else if (periodType === 'n' || periodType === 'h' || periodType === 'l') {
        let businessDaysAdded = 0;
        while (businessDaysAdded < numPeriods) {
            
          currentDate.setDate(currentDate.getDate() + 1);
            // Verifica el tipo de periodo y si el día es un día hábil
            if (
                periodType === 'n' || periodType === null ||
                (periodType === 'h' && currentDate.getDay() !== 0 && !holidays.includes(formatDate(currentDate))) ||
                (periodType === 'l' && currentDate.getDay() !== 0 && currentDate.getDay() !== 6 && !holidays.includes(formatDate(currentDate))) 
            ) {
                businessDaysAdded++;
            }

        }
    } 
        return formatDate(currentDate);
    }else{
        return null;
    }
}

function formatDate(date) {
  let day = date.getDate();
  let month = date.getMonth() + 1;
  let year = date.getFullYear();

  if (day < 10) {
      day = '0' + day;
  }

  if (month < 10) {
      month = '0' + month;
  }

  return year + '-' + month + '-' + day;
}


function formatearFecha(fecha) {
    if(fecha !==""){
    if(fecha.length===10){
      return fecha.substr(8, 2)+`-`+fecha.substr(5, 2)+`-`+fecha.substr(2, 2);
    }else{
    const dia = fecha.getDate().toString().padStart(2, '0');
    const mes = (fecha.getMonth() + 1).toString().padStart(2, '0'); // Meses comienzan desde 0
    const anio = fecha.getFullYear().toString().slice(-2); // Obtener los últimos dos dígitos del año

    return `${dia}-${mes}-${anio}`;
    }

    }else{
      return "";
    }
  }


// Función para realizar un ordenamiento topológico del grafo
function topologicalSort(graph) {
    const visited = {};
    const result = [];
    
    function visit(node) {
      if (!visited[node]) {
        visited[node] = true;
        graph[node].forEach(neighbor => visit(neighbor));
        result.unshift(node); // Agrega el nodo al principio del resultado
      }
    }
    
    for (const node in graph) {
      visit(node);
    }
    
    return result;
    }

    function asignarFechas(diagramaFlujo) {

        const steps = {};
      
        if (!diagramaFlujo.hasOwnProperty('steps')){
          return steps;
        }
      
        const graph = {}; // Grafo de dependencias
      
        // Inicializar los steps sin fechas y construir el grafo de dependencias
        diagramaFlujo.steps.forEach(step => {
          steps[step.id] = {
            id: step.id,
            duracion: parseInt(step.Duracion),
            unidad: step.unidadduracion,
            start_date: null,
            end_date: null
          };
          if (step.hasOwnProperty("fechafin")) {
            steps[step.id].fechafin = step.fechafin;
          }
          graph[step.id] = []; // Inicializar la lista de dependencias
        });
      
        // Construir el grafo de dependencias
        if (diagramaFlujo.hasOwnProperty('paths')){
        diagramaFlujo.paths.forEach(path => {
          if ((path.type === "path") || ((path.type === "ligtime") && (path.maxmin === "MN"))) {
            graph[path.endStep].push(path.startStep);
          }
        });
      }else{ //Sólo hay steps pero no paths
        diagramaFlujo.steps.forEach(step => {
          if (step.tipo === "step"){
            if (!step.start_date) {
                  if(diagramaFlujo.hasOwnProperty('fechaInicioProyecto')){
                    steps[step.id].start_date = diagramaFlujo.fechaInicioProyecto;
                  }else{
                    steps[step.id].start_date = new Date();
                }
              }
              steps[step.id].end_date = addBusinessPeriod(steps[step.id].start_date, steps[step.id].duracion, steps[step.id].unidadduracion, holidays);
          }
        }); 
        return steps; 
      }
      
        // Ordenamiento topológico
        const topologicalOrder = topologicalSort(graph);
      
      
        // Asignar fechas en el orden topológico
        // Asignar fechas en el orden topológico inverso
      for (let i = topologicalOrder.length - 1; i >= 0; i--) {
        const stepId = topologicalOrder[i];
        const currentStep = steps[stepId];
      
        
      
        // Encontrar los pasos previos en el grafo (dependencias)
        const dependencies = graph[stepId];
      
        // Si existen dependencias, itera sobre ellas y calcula las fechas
        if (dependencies.length > 0) {
          // Iterar sobre las dependencias
          dependencies.forEach(dependencyId => {
            const dependencyStep = steps[dependencyId];
            diagramaFlujo.paths.forEach(path => {
              
        if (((path.endStep===currentStep.id)&&(path.startStep===dependencyStep.id)&&(!(path.hasOwnProperty("closed"))))&&((path.type === "path")||((path.type === "ligtime")&&(path.maxmin === "MN")))) {
          
          const startStep = dependencyStep;
              const endStep = currentStep;
      
              //if (!startStep.start_date) {
              //    if(diagramaFlujo.hasOwnProperty('fechaInicioProyecto')){
              //      startStep.start_date = diagramaFlujo.fechaInicioProyecto;
              //    }else{
              //    startStep.start_date = new Date();
              //  }
              //}
              var endDateCandidate = "";
              if((path.type === "ligtime")&&(path.maxmin === "MN")){
                switch(path.tipoduracion){
                  case ("FI"):
                  var fechaInicio;
                  if(path.unidadduracion==="m"||path.unidadduracion==="a"){
                    fechaInicio= addBusinessPeriod(startStep.end_date, 1, "l", holidays);
                  }else{
                    fechaInicio= addBusinessPeriod(startStep.end_date, 1, path.unidadduracion, holidays);
                  }
                  endDateCandidate = addBusinessPeriod(fechaInicio, path.duracion, path.unidadduracion, holidays);
                  break;
                  case ("FF"):
                  endDateCandidate = addBusinessPeriod(startStep.end_date, path.duracion, path.unidadduracion, holidays);
                  break;
                  case ("II"):
                  case ("IF"):
                  endDateCandidate = addBusinessPeriod(startStep.start_date, path.duracion, path.unidadduracion, holidays);
                  break;
                }
                switch(path.tipoduracion){
                  case ("II"):
                  case ("FI"):
                  if (!endStep.start_date || endDateCandidate > endStep.start_date) {
                  endStep.start_date = endDateCandidate;
                  endStep.end_date = addBusinessPeriod(endStep.start_date, endStep.duracion-1, endStep.unidad, holidays);
                  }
                  break;
                  case ("FF"):
                  case ("IF"):
                  endStep.start_date = addBusinessPeriod(startStep.end_date, 1, 'l', holidays);
                  if (!endStep.end_date || endDateCandidate > endStep.end_date) {
                  endStep.end_date = endDateCandidate;
                  }
                  break;
                }
              }else{
                endDateCandidate = startStep.end_date; //addBusinessPeriod(startStep.end_date, 1, 'l', holidays);
                if (!endStep.start_date || endDateCandidate > endStep.start_date) {
                  endStep.start_date = endDateCandidate;
                }
                endStep.end_date = addBusinessPeriod(endStep.start_date, endStep.duracion, endStep.unidad, holidays);
              }
      
              if (endStep.hasOwnProperty('fechafin') && endStep.fechafin) {
                endStep.end_date = endStep.fechafin;
              }
      
            }else{
            }
            
      
      
      });
      
      
      
      
          });
        } else {
          // Si no existen dependencias, es un inicio
          
            if (diagramaFlujo.hasOwnProperty('fechaInicioProyecto')) {
              currentStep.start_date = diagramaFlujo.fechaInicioProyecto;
            } else {
              currentStep.start_date = new Date();
            }
      
            if (currentStep.hasOwnProperty('fechafin') && currentStep.fechafin) {
              currentStep.end_date = currentStep.fechafin;
            } else {
              // Si no es endStep, calcular la fecha de finalización usando addBusinessPeriod
              currentStep.end_date = addBusinessPeriod(currentStep.start_date, currentStep.duracion - 1, currentStep.unidad, holidays);
            }
      
          
        }
      
      
      
      
      
      
            // Asignar fechas al resto de steps a través de paths
      
      
          }
      
            // Comprobamos las ligaduras de tiempos máximos, que sólo van a dar mensaje de error si no se cumplen:
      
      
      // Resto del código para asignar fechas a los pasos no dependientes
      // ...
      return steps;
      }



      function textoUnidad(duracion, unidadInput){
        var unidadPresentada="";
        switch(unidadInput){
          case "l":
          if (duracion===1){
            unidadPresentada="día lab.";
          }else{
            unidadPresentada="días lab.";
          }
          break;
          case "h":
          if (duracion===1){
            unidadPresentada="día háb.";
          }else{
            unidadPresentada="días hab.";
          }
          break;
          case "n":
          if (duracion===1){
            unidadPresentada="día nat.";
          }else{
            unidadPresentada="días nat.";
          }

          break;
          case "m":
          if (duracion===1){
            unidadPresentada="mes";
          }else{
            unidadPresentada="meses";
          }
          break;
          case "a":
          if (duracion===1){
            unidadPresentada="año";
          }else{
            unidadPresentada="años";
          }
          break;
        }
        var resultado=duracion+" "+unidadPresentada;
        return resultado;
    }