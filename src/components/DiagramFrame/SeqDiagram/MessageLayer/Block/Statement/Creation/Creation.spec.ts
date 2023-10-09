import { shallowMount } from '@vue/test-utils';
import { createStore } from 'vuex';
import { VueSequence } from '@/index';
import Creation from './Creation.vue';
import { Fixture } from '../../../../../../../../test/unit/parser/fixture/Fixture';

function mountCreationWithCode(code: string, contextLocator: Function) {
  const storeConfig = VueSequence.Store();
  // @ts-ignore
  storeConfig.state.code = code;
  const store = createStore(storeConfig);

  let creationContext = contextLocator(code);
  const props = {
    context: creationContext,
    fragmentOffset: 100,
  };

  return shallowMount(Creation, { global: { plugins: [store] }, props });
}

describe('Creation', () => {
  it('data , props and computed properties', async () => {
    /**
     * Known limitations:
     * 1. `IA a = new A()` cannot be the first statement in the file. `IA` will be recognised as a Participant.
     */
    let creationWrapper = mountCreationWithCode('a = new A', Fixture.firstStatement);

    const vm = creationWrapper.vm as any;
    expect(vm.from).toBe('_STARTER_');
    expect(vm.signature).toBe('«create»');
    expect(vm.assignee).toBe('a');
    expect(vm.distance).toStrictEqual(expect.any(Function));
    expect(vm.interactionWidth).toBe(104);
    expect(vm.rightToLeft).toBeFalsy();
  });

  it('right to left', async () => {
    let creationWrapper = mountCreationWithCode('A.m{B.m{new A}}', Fixture.firstGrandChild);
    const vm = creationWrapper.vm as any;
    console.log(creationWrapper)
    expect(vm.rightToLeft).toBeTruthy();
    expect(vm.interactionWidth).toBe(160);
  });

  it('right to left within alt fragment', async () => {
    function contextLocator(code: string) {
      return Fixture.firstGrandChild(code).alt().ifBlock().braceBlock().block().stat()[0];
    }
    let creationWrapper = mountCreationWithCode('A.m{B.m{if(x){new A}}}', contextLocator);
    const vm = creationWrapper.vm as any;
    expect(vm.rightToLeft).toBeTruthy();
    expect(vm.interactionWidth).toBe(160);
  });
});
