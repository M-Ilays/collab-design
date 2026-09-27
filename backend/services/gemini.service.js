const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const generateUseCaseDiagram = async (projectRequirements) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    console.log(projectRequirements)
    const prompt = `
      Based on the following project requirements, generate a use case diagram in JSON format.
      Project Requirements:
      ${projectRequirements}

      Guidelines:
      1. Create actors and use cases based on the requirements
      2. Use appropriate relationships (association, include, extend, generalization)
      3. Position all elements (actors, use cases, etc.) in the top left quadrant of the diagram. Use only negative or small positive x and y coordinates (e.g., x: -800 to 0, y: -500 to 0). The top left corner should be the origin for layout.
      4. Use unique IDs for all elements and relationships
      5. Follow the exact JSON structure provided
      6. Ensure all coordinates and bounds are within the diagram size
      7. Look at example and follow the format, if you don't follow the format, you will be penalized
      8. Read example clearfully and generate  diagram in same nested structure as example
      9. Use Proper relationships, include, exclude, generalization etc.
      10. THe actors, users and system must be listed correctly for it.
      Example:
      {"version":"3.0.0","type":"UseCaseDiagram","size":{"width":1580,"height":1000},"interactive":{"elements":{},"relationships":{}},"elements":{"7332bdb7-b57e-40f1-8915-29cbffe2d362":{"id":"7332bdb7-b57e-40f1-8915-29cbffe2d362","name":"Hammad","type":"UseCaseActor","owner":null,"bounds":{"x":-770,"y":-270,"width":80,"height":140}},"e5d95612-b282-4f8e-8ec9-11f30842a011":{"id":"e5d95612-b282-4f8e-8ec9-11f30842a011","name":"System","type":"UseCaseSystem","owner":null,"bounds":{"x":-490,"y":-340,"width":800,"height":490}},"2b33bd7a-c063-4ea5-94b4-7798a73ca6bd":{"id":"2b33bd7a-c063-4ea5-94b4-7798a73ca6bd","name":"Email","type":"UseCase","owner":"e5d95612-b282-4f8e-8ec9-11f30842a011","bounds":{"x":50,"y":-250,"width":160,"height":100}},"8371fb50-6751-449c-83aa-c79ad4bd3c26":{"id":"8371fb50-6751-449c-83aa-c79ad4bd3c26","name":"Login","type":"UseCase","owner":"e5d95612-b282-4f8e-8ec9-11f30842a011","bounds":{"x":-410,"y":-250,"width":160,"height":100}},"9406e5ba-9513-4dd5-b161-85eda54f3515":{"id":"9406e5ba-9513-4dd5-b161-85eda54f3515","name":"2FA","type":"UseCase","owner":"e5d95612-b282-4f8e-8ec9-11f30842a011","bounds":{"x":60,"y":-100,"width":160,"height":100}},"9391704e-7ce6-4736-a6a9-602ca140b60f":{"id":"9391704e-7ce6-4736-a6a9-602ca140b60f","name":"User","type":"UseCaseActor","owner":null,"bounds":{"x":-770,"y":-480,"width":80,"height":140}}},"relationships":{"f3fa1491-e76c-470e-8cd7-0cf0ad78877f":{"id":"f3fa1491-e76c-470e-8cd7-0cf0ad78877f","name":"","type":"UseCaseAssociation","owner":null,"bounds":{"x":-690,"y":-200,"width":280,"height":1},"path":[{"x":0,"y":0},{"x":280,"y":0}],"source":{"direction":"Right","element":"7332bdb7-b57e-40f1-8915-29cbffe2d362"},"target":{"direction":"Left","element":"8371fb50-6751-449c-83aa-c79ad4bd3c26"},"isManuallyLayouted":false},"a4a61442-6a55-435a-ba30-465ea8dae7e8":{"id":"a4a61442-6a55-435a-ba30-465ea8dae7e8","name":"","type":"UseCaseInclude","owner":null,"bounds":{"x":-250,"y":-200,"width":300,"height":1},"path":[{"x":0,"y":0},{"x":300,"y":0}],"source":{"direction":"Right","element":"8371fb50-6751-449c-83aa-c79ad4bd3c26"},"target":{"direction":"Left","element":"2b33bd7a-c063-4ea5-94b4-7798a73ca6bd"},"isManuallyLayouted":false},"457ea1ec-6a4e-4922-93b8-cbf4d7ab6f48":{"id":"457ea1ec-6a4e-4922-93b8-cbf4d7ab6f48","name":"","type":"UseCaseExtend","owner":null,"bounds":{"x":-330,"y":-150,"width":390,"height":100},"path":[{"x":0,"y":0},{"x":390,"y":100}],"source":{"direction":"Down","element":"8371fb50-6751-449c-83aa-c79ad4bd3c26"},"target":{"direction":"Left","element":"9406e5ba-9513-4dd5-b161-85eda54f3515"},"isManuallyLayouted":false},"9da8c116-d2d2-4fb3-901b-649f1eec2f42":{"id":"9da8c116-d2d2-4fb3-901b-649f1eec2f42","name":"","type":"UseCaseGeneralization","owner":null,"bounds":{"x":-730,"y":-340,"width":1,"height":70},"path":[{"x":0,"y":70},{"x":0,"y":0}],"source":{"direction":"Up","element":"7332bdb7-b57e-40f1-8915-29cbffe2d362"},"target":{"direction":"Down","element":"9391704e-7ce6-4736-a6a9-602ca140b60f"},"isManuallyLayouted":false}},"assessments":{}}
    `;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No valid JSON found in the response');
    }

    const diagramData = JSON.parse(jsonMatch[0]);
    return { success: true, data: diagramData };
  } catch (error) {
    console.error('Error generating use case diagram:', error);
    return { 
      success: false, 
      message: error.message || 'Failed to generate use case diagram',
      error: error
    };
  }
};

const generateActivityDiagram = async (projectRequirements) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      Based on the following project requirements, generate an activity diagram in JSON format.
      Project Requirements:
      ${projectRequirements}

      Guidelines:
      1. Create a logical flow of activities based on the requirements
      2. Always include an initial node (ActivityInitialNode) and final node (ActivityFinalNode)
      3. Use ActivityActionNode for main actions/processes
      4. Use ActivityObjectNode for data objects
      5. Use ActivityMergeNode for decision points
      6. Use ActivityForkNode and ActivityForkNodeHorizontal for parallel processes
      7. Use ActivityControlFlow for connections between nodes
      8. Position elements logically with proper spacing
      9. Use unique IDs for all elements and relationships
      10. Follow the exact JSON structure provided
      11. Ensure all coordinates and bounds are within the diagram size
      12. The example shows the structure and available options

      Important Rules:
      - Initial node must be at the top (y: -500 to -400)
      - Action nodes should be connected in sequence
      - Fork nodes should have multiple outgoing flows
      - Merge nodes should have multiple incoming flows
      - All paths must eventually lead to a final node
      - Keep the diagram width between 600-1000 and height between 800-1200
      - Every relationship MUST include a path array with at least 2 points
      - Path points must be relative to the relationship's bounds
      - Each path point must have x and y coordinates
      - Source and target must have valid direction and element properties
      - Position all elements in the upper half of the canvas (y: -500 to 0)
      - Maintain vertical spacing of 100-150 pixels between elements
      - Keep horizontal spacing of 200-300 pixels between parallel elements

      Example Relationship Structure:
      {
        "id": "unique-id",
        "name": "",
        "type": "ActivityControlFlow",
        "owner": null,
        "bounds": {"x": 0, "y": -400, "width": 100, "height": 100},
        "path": [
          {"x": 0, "y": 0},
          {"x": 100, "y": 100}
        ],
        "source": {
          "direction": "Down",
          "element": "source-element-id"
        },
        "target": {
          "direction": "Up",
          "element": "target-element-id"
        },
        "isManuallyLayouted": false
      }

      Example:
      {"version":"3.0.0","type":"ActivityDiagram","size":{"width":800,"height":1120},"interactive":{"elements":{},"relationships":{}},"elements":{"a6d0c423-6eb2-4ee8-8524-79ae9a427326":{"id":"a6d0c423-6eb2-4ee8-8524-79ae9a427326","name":"Swimlane","type":"ActivitySwimlane","owner":null,"bounds":{"x":-380,"y":-540,"width":480,"height":860}},"50e09c8d-2ef4-41f0-b261-ad4b97a1c5d8":{"id":"50e09c8d-2ef4-41f0-b261-ad4b97a1c5d8","name":"Activity","type":"Activity","owner":null,"bounds":{"x":-360,"y":-460,"width":160,"height":100}},"b2c631c5-ff77-4991-94fa-31b4e9d0b316":{"id":"b2c631c5-ff77-4991-94fa-31b4e9d0b316","name":"Action","type":"ActivityActionNode","owner":null,"bounds":{"x":-120,"y":-390,"width":160,"height":100}},"43badcfe-57a0-4be3-9279-6e84d5b2e859":{"id":"43badcfe-57a0-4be3-9279-6e84d5b2e859","name":"Object","type":"ActivityObjectNode","owner":null,"bounds":{"x":-240,"y":-170,"width":160,"height":100}},"1543586f-629c-418b-9684-1b6f3ed1c274":{"id":"1543586f-629c-418b-9684-1b6f3ed1c274","name":"Condition","type":"ActivityMergeNode","owner":null,"bounds":{"x":-360,"y":-40,"width":160,"height":100}},"6c9bf52c-5c88-4450-98b0-1dfebd51687c":{"id":"6c9bf52c-5c88-4450-98b0-1dfebd51687c","name":"","type":"ActivityForkNode","owner":null,"bounds":{"x":-10,"y":-30,"width":20,"height":220}},"0e015d0f-5d75-4dc2-b50f-0d5c9a2d7537":{"id":"0e015d0f-5d75-4dc2-b50f-0d5c9a2d7537","name":"","type":"ActivityForkNodeHorizontal","owner":null,"bounds":{"x":-300,"y":230,"width":260,"height":20}}},"relationships":{"c8e9951a-4d46-44e6-90f9-18d62fbf077f":{"id":"c8e9951a-4d46-44e6-90f9-18d62fbf077f","name":"","type":"ActivityControlFlow","owner":null,"bounds":{"x":-105,"y":135,"width":95,"height":95},"path":[{"x":95,"y":0},{"x":0,"y":0},{"x":0,"y":95}],"source":{"direction":"Downleft","element":"6c9bf52c-5c88-4450-98b0-1dfebd51687c"},"target":{"direction":"Topright","element":"0e015d0f-5d75-4dc2-b50f-0d5c9a2d7537"},"isManuallyLayouted":false},"a7d84ab0-4f70-45e7-b6a6-5c9ec9839cde":{"id":"a7d84ab0-4f70-45e7-b6a6-5c9ec9839cde","name":"","type":"ActivityControlFlow","owner":null,"bounds":{"x":-235,"y":80,"width":240,"height":220},"path":[{"x":225,"y":0},{"x":-4.5,"y":0},{"x":-4.5,"y":210},{"x":0,"y":170}],"source":{"direction":"Left","element":"6c9bf52c-5c88-4450-98b0-1dfebd51687c"},"target":{"direction":"Bottomleft","element":"0e015d0f-5d75-4dc2-b50f-0d5c9a2d7537"},"isManuallyLayouted":true},"8ca2edc7-7fb0-4d30-9bbc-8e52f82a0682":{"id":"8ca2edc7-7fb0-4d30-9bbc-8e52f82a0682","name":"","type":"ActivityControlFlow","owner":null,"bounds":{"x":-170,"y":25,"width":160,"height":205},"path":[{"x":160,"y":0},{"x":0,"y":0},{"x":0,"y":205}],"source":{"direction":"Upleft","element":"6c9bf52c-5c88-4450-98b0-1dfebd51687c"},"target":{"direction":"Up","element":"0e015d0f-5d75-4dc2-b50f-0d5c9a2d7537"},"isManuallyLayouted":false},"49bc16ea-13a1-4a85-af0c-bd9403f99897":{"id":"49bc16ea-13a1-4a85-af0c-bd9403f99897","name":"","type":"ActivityControlFlow","owner":null,"bounds":{"x":-100,"y":-290,"width":1,"height":120},"path":[{"x":0,"y":0},{"x":0,"y":120}],"source":{"direction":"Down","element":"b2c631c5-ff77-4991-94fa-31b4e9d0b316"},"target":{"direction":"Up","element":"43badcfe-57a0-4be3-9279-6e84d5b2e859"},"isManuallyLayouted":false}},"assessments":{}}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No valid JSON found in the response');
    }

    const diagramData = JSON.parse(jsonMatch[0]);
    return { success: true, data: diagramData };
  } catch (error) {
    console.error('Error generating activity diagram:', error);
    return { 
      success: false, 
      message: error.message || 'Failed to generate activity diagram',
      error: error
    };
  }
};

const generateClassDiagram = async (projectRequirements) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      Based on the following project requirements, generate a class diagram in JSON format.
      Project Requirements:
      ${projectRequirements}

      Guidelines:
      1. Create classes based on the main entities in the requirements
      2. Add appropriate attributes and methods to each class
      3. Use proper relationships between classes:
         - ClassInheritance: for parent-child relationships
         - ClassUnidirectional: for one-way associations
         - ClassBidirectional: for two-way associations
         - ClassAggregation: for "has-a" relationships (weak ownership)
         - ClassComposition: for "has-a" relationships (strong ownership)
         - ClassDependency: for "uses" relationships
         - ClassRealization: for interface implementations
      4. Position all elements in the top left quadrant of the diagram. Use only negative or small positive x and y coordinates (e.g., x: -800 to 0, y: -500 to 0). The top left corner should be the origin for layout.
      5. Use unique IDs for all elements and relationships
      6. Follow the exact JSON structure provided
      7. Ensure all coordinates and bounds are within the diagram size
      8. The example shows the structure and available options

      Important Rules:
      - Keep class names clear and descriptive
      - Use proper visibility modifiers (+ for public, - for private, # for protected)
      - Include data types for attributes
      - Include return types for methods
      - Keep the diagram width between 1200-2000 and height between 600-1000
      - Maintain proper spacing between elements (at least 100 pixels)
      - Use Package elements to group related classes
      - Use Interface elements for abstract contracts
      - Use AbstractClass for abstract classes
      - Use Enumeration for enumerated types
      - Every relationship MUST include proper source and target objects
      - Source and target must have valid direction, element, multiplicity, and role properties
      - Direction must be one of: Up, Down, Left, Right, Upleft, Upright, Downleft, Downright
      - Multiplicity should be a string (e.g., "1", "2", "1..*", "*")
      - Role should be a string describing the relationship role
      - Position all elements in the upper half of the canvas (y: -400 to 0)
      - Maintain vertical spacing of 150-200 pixels between elements
      - Keep horizontal spacing of 250-350 pixels between parallel elements
      - Package elements should be at the top (y: -400 to -300)
      - Interface elements should be below packages (y: -300 to -200)
      - Class elements should be below interfaces (y: -200 to -100)
      - Abstract classes should be at the same level as regular classes
      - Enumerations should be at the bottom of the upper half (y: -100 to 0)

      Example Relationship Structure:
      {
        "id": "unique-id",
        "name": "",
        "type": "ClassUnidirectional",
        "owner": null,
        "bounds": {"x": 0, "y": -300, "width": 100, "height": 100},
        "path": [
          {"x": 0, "y": 0},
          {"x": 100, "y": 100}
        ],
        "source": {
          "direction": "Right",
          "element": "source-element-id",
          "multiplicity": "1",
          "role": "sourceRole"
        },
        "target": {
          "direction": "Left",
          "element": "target-element-id",
          "multiplicity": "1",
          "role": "targetRole"
        },
        "isManuallyLayouted": false
      }

      Example:
      {"version":"3.0.0","type":"ClassDiagram","size":{"width":1900,"height":780},"interactive":{"elements":{},"relationships":{}},"elements":{"9e73e879-97c5-4d9a-b1ad-9e79248c213e":{"id":"9e73e879-97c5-4d9a-b1ad-9e79248c213e","name":"Package","type":"Package","owner":null,"bounds":{"x":-930,"y":-370,"width":160,"height":100}},"d12e1a01-1e6a-4aae-b8f4-e267373e8cb9":{"id":"d12e1a01-1e6a-4aae-b8f4-e267373e8cb9","name":"Class","type":"Class","owner":null,"bounds":{"x":-650,"y":-360,"width":160,"height":100},"attributes":["848d52fc-4be6-4e6b-a3f6-a45987b0bc6f"],"methods":["bfcd6b84-272f-407d-b4d8-ea9a1c8fd76a"]},"848d52fc-4be6-4e6b-a3f6-a45987b0bc6f":{"id":"848d52fc-4be6-4e6b-a3f6-a45987b0bc6f","name":"+ attribute: Type","type":"ClassAttribute","owner":"d12e1a01-1e6a-4aae-b8f4-e267373e8cb9","bounds":{"x":-649.5,"y":-319.5,"width":159,"height":30}},"bfcd6b84-272f-407d-b4d8-ea9a1c8fd76a":{"id":"bfcd6b84-272f-407d-b4d8-ea9a1c8fd76a","name":"+ method()","type":"ClassMethod","owner":"d12e1a01-1e6a-4aae-b8f4-e267373e8cb9","bounds":{"x":-649.5,"y":-289.5,"width":159,"height":30}},"6cf0a135-d568-4e70-a26e-1dbf5fba84c3":{"id":"6cf0a135-d568-4e70-a26e-1dbf5fba84c3","name":"Abstract","type":"AbstractClass","owner":null,"bounds":{"x":-650,"y":-70,"width":160,"height":110},"attributes":["14bcd197-86c2-48de-897b-bc728d5b4868"],"methods":["e044246b-4487-467d-9aa3-77356cbfb1de"]},"14bcd197-86c2-48de-897b-bc728d5b4868":{"id":"14bcd197-86c2-48de-897b-bc728d5b4868","name":"+ attribute: Type","type":"ClassAttribute","owner":"6cf0a135-d568-4e70-a26e-1dbf5fba84c3","bounds":{"x":-649.5,"y":-19.5,"width":159,"height":30}},"e044246b-4487-467d-9aa3-77356cbfb1de":{"id":"e044246b-4487-467d-9aa3-77356cbfb1de","name":"+ method()","type":"ClassMethod","owner":"6cf0a135-d568-4e70-a26e-1dbf5fba84c3","bounds":{"x":-649.5,"y":10.5,"width":159,"height":30}},"b22af7a2-ec82-4e42-9ee8-67fb3822890d":{"id":"b22af7a2-ec82-4e42-9ee8-67fb3822890d","name":"Interface","type":"Interface","owner":null,"bounds":{"x":80,"y":-230,"width":160,"height":110},"attributes":["57ce5760-2763-41f6-ad1d-54bcd265fd68"],"methods":["e4bf64d5-7ee3-4196-957d-6e5ae80150fd"]},"57ce5760-2763-41f6-ad1d-54bcd265fd68":{"id":"57ce5760-2763-41f6-ad1d-54bcd265fd68","name":"+ attribute: Type","type":"ClassAttribute","owner":"b22af7a2-ec82-4e42-9ee8-67fb3822890d","bounds":{"x":80.5,"y":-179.5,"width":159,"height":30}},"e4bf64d5-7ee3-4196-957d-6e5ae80150fd":{"id":"e4bf64d5-7ee3-4196-957d-6e5ae80150fd","name":"+ method()","type":"ClassMethod","owner":"b22af7a2-ec82-4e42-9ee8-67fb3822890d","bounds":{"x":80.5,"y":-149.5,"width":159,"height":30}},"d4d7ad2f-7950-4b6b-9a96-d6223d6b8727":{"id":"d4d7ad2f-7950-4b6b-9a96-d6223d6b8727","name":"Interface","type":"Interface","owner":null,"bounds":{"x":-540,"y":120,"width":160,"height":110},"attributes":["94b022d5-87c4-404e-8a1b-89759a50617a"],"methods":["d10c4fb5-3bf1-4751-a098-da0b3238b905"]},"94b022d5-87c4-404e-8a1b-89759a50617a":{"id":"94b022d5-87c4-404e-8a1b-89759a50617a","name":"+ attribute: Type","type":"ClassAttribute","owner":"d4d7ad2f-7950-4b6b-9a96-d6223d6b8727","bounds":{"x":-539.5,"y":170.5,"width":159,"height":30}},"d10c4fb5-3bf1-4751-a098-da0b3238b905":{"id":"d10c4fb5-3bf1-4751-a098-da0b3238b905","name":"+ method()","type":"ClassMethod","owner":"d4d7ad2f-7950-4b6b-9a96-d6223d6b8727","bounds":{"x":-539.5,"y":200.5,"width":159,"height":30}},"50b0d8e8-622c-4f86-9474-23dcb6f8963d":{"id":"50b0d8e8-622c-4f86-9474-23dcb6f8963d","name":"Enumeration","type":"Enumeration","owner":null,"bounds":{"x":-80,"y":20,"width":160,"height":140},"attributes":["2b142168-4c36-4727-a358-b508b2acedfa","0a377193-df8d-43ef-bfcc-960954ed5cd3","840df0d7-72a4-43cf-9d63-5c3472816b97"],"methods":[]},"2b142168-4c36-4727-a358-b508b2acedfa":{"id":"2b142168-4c36-4727-a358-b508b2acedfa","name":"Case 1","type":"ClassAttribute","owner":"50b0d8e8-622c-4f86-9474-23dcb6f8963d","bounds":{"x":-79.5,"y":70.5,"width":159,"height":30}},"0a377193-df8d-43ef-bfcc-960954ed5cd3":{"id":"0a377193-df8d-43ef-bfcc-960954ed5cd3","name":"Case 2","type":"ClassAttribute","owner":"50b0d8e8-622c-4f86-9474-23dcb6f8963d","bounds":{"x":-79.5,"y":100.5,"width":159,"height":30}},"840df0d7-72a4-43cf-9d63-5c3472816b97":{"id":"840df0d7-72a4-43cf-9d63-5c3472816b97","name":"Case 3","type":"ClassAttribute","owner":"50b0d8e8-622c-4f86-9474-23dcb6f8963d","bounds":{"x":-79.5,"y":130.5,"width":159,"height":30}}},"relationships":{"5907d39b-e0eb-434e-8408-e623d8207958":{"id":"5907d39b-e0eb-434e-8408-e623d8207958","name":"","type":"ClassUnidirectional","owner":null,"bounds":{"x":-490,"y":-320,"width":664.1499996185303,"height":90},"path":[{"x":0,"y":10},{"x":650,"y":10},{"x":650,"y":90}],"source":{"direction":"Right","element":"d12e1a01-1e6a-4aae-b8f4-e267373e8cb9","multiplicity":"1","role":"Role"},"target":{"direction":"Up","element":"b22af7a2-ec82-4e42-9ee8-67fb3822890d","multiplicity":"2","role":"Role"},"isManuallyLayouted":false},"7d0dd27c-ddcd-46e6-aff6-5c97575ad9ff":{"id":"7d0dd27c-ddcd-46e6-aff6-5c97575ad9ff","name":"","type":"ClassDependency","owner":null,"bounds":{"x":-490,"y":-25,"width":410,"height":136},"path":[{"x":0,"y":10},{"x":205,"y":10},{"x":205,"y":115},{"x":410,"y":115}],"source":{"direction":"Right","element":"6cf0a135-d568-4e70-a26e-1dbf5fba84c3","multiplicity":"","role":""},"target":{"direction":"Left","element":"50b0d8e8-622c-4f86-9474-23dcb6f8963d","multiplicity":"","role":""},"isManuallyLayouted":false}},"assessments":{}}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No valid JSON found in the response');
    }

    const diagramData = JSON.parse(jsonMatch[0]);
    return { success: true, data: diagramData };
  } catch (error) {
    console.error('Error generating class diagram:', error);
    return { 
      success: false, 
      message: error.message || 'Failed to generate class diagram',
      error: error
    };
  }
};

module.exports = {
  generateUseCaseDiagram,
  generateActivityDiagram,
  generateClassDiagram
}; 