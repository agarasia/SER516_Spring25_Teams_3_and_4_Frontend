<template>
  <div class="tag-input">
    <div class="input-row">
      <input v-model="newKey" placeholder="Tag" @keyup.enter="addTag" class="input-field" aria-label="Tag" />
      <input v-model="newValue" placeholder="Weight" @keyup.enter="addTag" class="input-field" aria-label="Weight" />
      <button class="add-button" @click="addTag" :disabled="!newKey || !newValue" aria-label="Add Tag">
        <span class="add-icon">+</span> Add Tag
      </button>
    </div>
    <div class="tagsData">
      <transition-group name="tag" tag="div">
        <span v-for="(tag, index) in tagsData" :key="tag.id" class="tag">
          <span class="tag-label">{{ tag.key }}:</span>
          <span class="tag-value">{{ tag.value }}</span>
          <button class="remove-tag" @click="removeTag(index)" aria-label="Remove Tag">
            ×
          </button>
        </span>
      </transition-group>
    </div>
  </div>
</template>

<script>
import { ref, watch } from "vue";

export default {
  props: {
    tags: {
      type: Array,
      default: () => []
    }
  },
  setup(props, { emit }) {
    const tagsData = ref([...props.tags]);
    const newKey = ref("");
    const newValue = ref("");

    // Sync local state when parent updates the tags
    watch(() => props.tags, (newTags) => {
      tagsData.value = [...newTags];
    });

    const addTag = () => {
      if (newKey.value && newValue.value) {
        tagsData.value.push({ key: newKey.value, value: newValue.value });
        emit("update:tags", tagsData.value);
        newKey.value = "";
        newValue.value = "";
      }
    };

    const removeTag = (index) => {
      tagsData.value.splice(index, 1);
      emit("update:tags", tagsData.value);
    };

    return {
      tagsData,
      newKey,
      newValue,
      addTag,
      removeTag
    };
  }
};
</script>

<style scoped>
/* Overall container styling with responsive padding and shadow */
.tag-input {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.25rem;
  background: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

/* Input row for horizontal layout; flex-wrap for responsiveness */
.input-row {
  display: flex;
  gap: 0.625rem;
  align-items: center;
  flex-wrap: wrap;
}

/* Input field styling using relative units for scalability */
.input-field {
  flex: 1;
  min-width: 150px;
  padding: 0.5rem 0.5rem;
  border: 1px solid #ccc;
  border-radius: 0.375rem;
  font-size: 0.8rem;
  transition: border-color 0.3s ease;
}

.input-field:focus {
  border-color: #007BFF;
  outline: none;
}

/* Add button styling */
.add-button {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  background: #007BFF;
  color: #fff;
  border: none;
  padding: 0.7rem 0.7rem;
  border-radius: 0.25rem;
  cursor: pointer;
  transition: background-color 0.3s ease;
  font-size: 0.8rem;
  white-space: nowrap;
  min-width: auto;
}

.add-button:disabled {
  background: #cdcdcd;
  cursor: not-allowed;
}

.add-button:hover:not(:disabled) {
  background: #0056b3;
}

/* Container for the tags */
.tagsData {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

/* Individual tag styling */
.tag {
  display: inline-flex;
  align-items: center;
  background: #f0f4f8;
  padding: 0.3rem 0.9rem;
  border-radius: 15px;
  font-size: 0.8rem;
  color: #333;
  transition: transform 0.3s ease, opacity 0.3s ease;
  will-change: transform, opacity;
  margin: 0.2rem;
  /* Reduce margin */
  transform: translateZ(0);
}

.tag:hover {
  background: #e1e8ed;
}

.tag-label {
  font-weight: bold;
  margin-right: 0.25rem;
}

/* Remove tag button styling */
.remove-tag {
  background: transparent;
  border: none;
  margin-left: 0.5rem;
  font-size: 1.2rem;
  cursor: pointer;
  color: #ff5c5c;
  transition: color 0.3s ease;
}

.remove-tag:hover {
  color: #ff0000;
}

/* Enter transitions */
.tag-enter-active {
  transition: opacity 0.3s ease-out, transform 0.3s ease-out;
  will-change: opacity, transform;
}

.tag-enter-from {
  opacity: 0;
  transform: scale(0.8) translateY(-10px);
}

.tag-enter-to {
  opacity: 1;
  transform: scale(1) translateY(0);
}

/* Leave transitions */
.tag-leave-active {
  transition: opacity 0.2s ease-in, transform 0.2s ease-in;
  will-change: opacity, transform;
}

.tag-leave-from {
  opacity: 1;
  transform: scale(1) translateY(0);
}

.tag-leave-to {
  opacity: 0;
  transform: scale(0.8) translateY(10px);
}

/* Reordering movement */
.tag-move {
  transition: transform 0.3s ease;
  will-change: transform;
}


/* Responsive adjustments for smaller screens */
@media (max-width: 600px) {
  .input-row {
    flex-direction: column;
    align-items: stretch;
  }

  .add-button {
    width: 100%;
    justify-content: center;
  }
}
</style>