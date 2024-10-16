function getArrayHeapPointer(array) {
    const typedArray = Float32Array.from(array);
    const heapPointer = Module._malloc(
      typedArray.length * typedArray.BYTES_PER_ELEMENT
    );
    Module["HEAPF32"].set(typedArray, heapPointer >> 2);
    return heapPointer;
}

// Load and run WebAssembly module
async function computePearsonCoefficient(firstVector, secondVector) {
    const firstVectorPointer = getArrayHeapPointer(firstVector);
    const secondVectorPointer = getArrayHeapPointer(secondVector);
    const coefficient = Module.ccall(
        "computePearsonCoefficient",
        "number",
        ["number", "number", "number"],
        [
            firstVectorPointer,
            secondVectorPointer,
            firstVector.length
        ]
    );
    Module._free(firstVectorPointer);
    Module._free(secondVectorPointer);
    return coefficient;
}